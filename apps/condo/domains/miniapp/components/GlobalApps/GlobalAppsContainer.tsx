import React, { useRef, useEffect, useState, useCallback, useContext } from 'react'
import { notification } from 'antd'
import { useHotkeys } from 'react-hotkeys-hook'
import get from 'lodash/get'
import isObject from 'lodash/isObject'
import isFunction from 'lodash/isFunction'
import isNull from 'lodash/isNull'
import omit from 'lodash/omit'
import { v4 as uuidV4 } from 'uuid'
import { MutationEmitter, MUTATION_RESULT_EVENT } from '@open-condo/next/apollo'
import { useAuth } from '@open-condo/next/auth'
import { SortB2BAppsBy } from '@app/condo/schema'
import { useDeepCompareEffect } from '@condo/domains/common/hooks/useDeepCompareEffect'
import { extractOrigin } from '@condo/domains/common/utils/url.utils'
import {
    IFRAME_MODAL_ACTION_MESSAGE_TYPE,
    NOTIFICATION_MESSAGE_TYPE,
    TASK_MESSAGE_TYPE,
    COMMAND_MESSAGE_TYPE,
    sendMessage,
    parseMessage,
} from '@condo/domains/common/utils/iframe.utils'
import { B2BApp } from '@condo/domains/miniapp/utils/clientSchema'
import GlobalIframe from './GlobalIframe'
import { TasksContext } from '@condo/domains/common/components/tasks/'
import { useMiniappTaskUIInterface } from '@condo/domains/common/hooks/useMiniappTaskUIInterface'
import IFrameModal from '../IFrameModal'
import dayjs from 'dayjs'
import {
    useGlobalAppsFeaturesContext,
    IRequestFeatureHandler,
} from './GlobalAppsFeaturesContext'

type ModalInfo = {
    url: string
    closable: boolean
    ownerOrigin: string
}

const MUTATION_RESULT_MESSAGE_NAME = 'CondoWebUserEventResult'
const MODAL_OPEN_RESULT_MESSAGE_NAME = 'CondoWebOpenModalResult'
const MODAL_CLOSE_RESULT_MESSAGE_NAME = 'CondoWebCloseModalResult'
const REQUEST_FEATURE_MESSAGE_NAME = 'CondoWebFeatureRequest'
const MODAL_CLOSE_USER_REASON = 'userAction'
const MODAL_CLOSE_APP_REASON = 'externalCommand'
const TASK_GET_PROCESSING_STATUS = 'CondoWebGetProcessingTasks'

export const GlobalAppsContainer: React.FC = () => {
    const { user } = useAuth()
    const { objs, refetch, loading } = B2BApp.useObjects({
        where: {
            isGlobal: true,
            isHidden: false,
        },
        sortBy: [SortB2BAppsBy.CreatedAtAsc],
    })

    const appUrls = objs.map(app => app.appUrl)
    const appOrigins = appUrls.map(extractOrigin)


    const iframeRefs = useRef<Array<HTMLIFrameElement>>([])
    const isGlobalAppsFetched = useRef(false)
    const [modals, setModals] = useState<{ [id: string]: ModalInfo }>({})
    const [isDebug, setIsDebug] = useState(false)
    const { registerFeatures, addFeatureHandler, removeFeatureHandler, features } = useGlobalAppsFeaturesContext()

    const { addTask, updateTask, tasks } = useContext(TasksContext)
    const { MiniAppTask: miniAppTaskUIInterface } = useMiniappTaskUIInterface()


    useHotkeys('d+e+b+u+g', () => setIsDebug(!isDebug), {}, [isDebug])

    useEffect(() => {
        iframeRefs.current = iframeRefs.current.slice(0, appUrls.length)
    }, [appUrls])

    useDeepCompareEffect(() => {
        const globalFeatures = objs.reduce((registeredFeatures, app) => {
            const appOrigin = extractOrigin(app.appUrl)
            const availableFeatures = (app.features || []).filter(featureName => !(featureName in registeredFeatures))
            const appFeatures = Object.assign({}, ...availableFeatures.map(featureName => ({ [featureName]: appOrigin })))

            return {
                ...registeredFeatures,
                ...appFeatures,
            }
        }, {})
        registerFeatures(globalFeatures)
    }, [registerFeatures, objs])

    const handleMutationResult = useCallback((payload) => {
        for (const iframe of iframeRefs.current) {
            if (iframe) {
                const origin = extractOrigin(iframe.src)
                const targetWindow = get(iframe, 'contentWindow', null)
                if (origin && targetWindow) {
                    sendMessage({
                        type: MUTATION_RESULT_MESSAGE_NAME,
                        data: payload,
                    }, targetWindow, origin)
                }
            }
        }
    }, [])

    const handleTask = useCallback((message, event) => {
        const taskRecord = {
            id: get(message, 'id'),
            taskId: message.taskId,
            title: message.taskTitle,
            progress: message.taskProgress,
            description: message.taskDescription,
            status: message.taskStatus,
            sender: event.origin,
            user,
            __typename: 'MiniAppTask',
            createdAt: dayjs().toISOString(),
        }

        if (message.taskOperation === 'create') {
            taskRecord.id = uuidV4()
            const createMiniAppTask = miniAppTaskUIInterface.storage.useCreateTask({}, () => {
                addTask({
                    ...miniAppTaskUIInterface,
                    record: taskRecord,
                })
            })
            createMiniAppTask(taskRecord)

            for (const iframe of iframeRefs.current) {
                const targetOrigin = extractOrigin(iframe.src)
                if (targetOrigin !== taskRecord.sender) continue

                const targetWindow = get(iframe, 'contentWindow', null)
                if (targetWindow) {

                    sendMessage({
                        type: TASK_GET_PROCESSING_STATUS,
                        data: { tasks: [taskRecord] },
                    }, targetWindow, targetOrigin)
                }
            }

        } else if (message.taskOperation === 'update') {
            const updateMiniAppTask = miniAppTaskUIInterface.storage.useUpdateTask({}, () => {
                updateTask(taskRecord)
            })

            updateMiniAppTask(taskRecord, { id: taskRecord.id })
        }
    }, [miniAppTaskUIInterface, addTask, updateTask])

    const handleGetTasks = useCallback((message, event) => {
        const senderTasks = tasks.map(task => task.record)
            .filter((task) => task.sender === event.origin && task.user && get(task, 'user.id') === user.id)

        event.source.postMessage({
            type: TASK_GET_PROCESSING_STATUS,
            data: { tasks: senderTasks },
        }, event.origin)
    }, [tasks])

    const handleCommand = useCallback((message, event) => {
        switch (message.command) {
            case 'getUser':
                event.source.postMessage({ id: message.id, data: user }, event.origin)
                break
        }
    }, [user])

    // TODO(DOMA-3435, @savelevMatthew) Refactor message structure after moving to lib
    const handleNotification = useCallback((message) => {
        const notificationFunction = get(notification, message.notificationType)
        if (isFunction(notificationFunction)) {
            notificationFunction({ message: message.message })
        }
    }, [])

    const registerModal = useCallback((message, event) => {
        const id = uuidV4()
        setModals((prev) => ({
            ...prev,
            [id]: { url: message.url, closable: message.closable, ownerOrigin: event.origin },
        }))
        event.source.postMessage({
            type: MODAL_OPEN_RESULT_MESSAGE_NAME,
            data: { modalId: id },
        }, event.origin)
    }, [])

    const deleteModal = useCallback((id, reason) => {
        if (modals[id]) {
            setModals(omit(modals, id))
            for (const iframe of iframeRefs.current) {
                const targetOrigin = extractOrigin(iframe.src)
                const targetWindow = get(iframe, 'contentWindow', null)
                if (targetOrigin !== modals[id].ownerOrigin) continue
                if (targetWindow) {
                    sendMessage({
                        type: MODAL_CLOSE_RESULT_MESSAGE_NAME,
                        data: { modalId: id, reason },
                    }, targetWindow, targetOrigin)
                }
            }
        }
    }, [modals])

    const deleteModalFromApp = useCallback((id, event) => {
        if (modals[id]) {
            if (modals[id].ownerOrigin !== event.origin) {
                // TODO(DOMA-3435, @savelevMatthew) Send failure message here after moving to lib
            } else {
                deleteModal(id, MODAL_CLOSE_APP_REASON)
            }
        } else {
            // TODO(DOMA-3435, @savelevMatthew) Send failure message here after moving to lib
        }
    }, [modals, deleteModal])

    const deleteModalFromUser = useCallback((id) => {
        deleteModal(id, MODAL_CLOSE_USER_REASON)
    }, [deleteModal])

    const handleMessage = useCallback((event: MessageEvent) => {
        if (!appOrigins.includes(event.origin)) return
        if (!event.data || !isObject(event.data)) return
        const parsedMessage = parseMessage(event.data)
        if (!parsedMessage) return
        const { type, message } = parsedMessage
        if (type === 'system') {
            switch (message.type) {
                case COMMAND_MESSAGE_TYPE:
                    return handleCommand(message, event)
                case TASK_MESSAGE_TYPE:
                    if (message.taskOperation === 'create' || message.taskOperation === 'update') {
                        return handleTask(message, event)
                    } else if (message.taskOperation === 'get') {
                        return handleGetTasks(message, event)
                    }

                    return
                case NOTIFICATION_MESSAGE_TYPE:
                    return handleNotification(message)
                case IFRAME_MODAL_ACTION_MESSAGE_TYPE:
                    if (message.action === 'open') {
                        return registerModal(message, event)
                    } else if (message.action === 'close') {
                        return deleteModalFromApp(message.modalId, event)
                    }

                    return
            }
        }
    }, [
        appOrigins,
        handleNotification,
        registerModal,
        deleteModalFromApp,
        handleTask,
        handleCommand,
        handleGetTasks,
    ])

    const handleFeatureRequest: IRequestFeatureHandler = useCallback((context) => {
        const receiverOrigin = get(features, context.feature)
        if (receiverOrigin) {
            for (const iframe of iframeRefs.current) {
                if (iframe) {
                    const origin = extractOrigin(iframe.src)
                    if (receiverOrigin === origin) {
                        const targetWindow = get(iframe, 'contentWindow', null)
                        if (origin && targetWindow) {
                            sendMessage({
                                type: REQUEST_FEATURE_MESSAGE_NAME,
                                data: context,
                            }, targetWindow, origin)
                        }
                    }
                }
            }
        }
    }, [features])

    useEffect(() => {
        addFeatureHandler(handleFeatureRequest)

        return () => {
            removeFeatureHandler(handleFeatureRequest)
        }
    }, [
        handleFeatureRequest,
        addFeatureHandler,
        removeFeatureHandler,
    ])

    useEffect(() => {
        MutationEmitter.on(MUTATION_RESULT_EVENT, handleMutationResult)
        return () => {
            MutationEmitter.off(MUTATION_RESULT_EVENT, handleMutationResult)
        }
    }, [handleMutationResult])

    useEffect(() => {
        window.addEventListener('message', handleMessage)

        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [handleMessage])

    useEffect(() => {
        if (!isGlobalAppsFetched.current && !loading && !isNull(user)) {
            refetch()
            isGlobalAppsFetched.current = true
        }
    }, [user, loading])

    // Global miniapps allowed only for authenticated users
    if (!user) {
        return null
    }

    return (
        <>
            {appUrls.map((url, index) => (
                <GlobalIframe
                    key={`${get(user, 'id', null)}-${url}`}
                    pageUrl={url}
                    ref={el => iframeRefs.current[index] = el}
                    hidden={!isDebug}
                />
            ))}
            {Object.keys(modals).map((id) => (
                <IFrameModal
                    key={id}
                    id={id}
                    pageUrl={modals[id].url}
                    closable={modals[id].closable}
                    onClose={deleteModalFromUser}
                />
            ))}
        </>
    )
}
