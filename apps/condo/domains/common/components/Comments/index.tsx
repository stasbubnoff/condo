import get from 'lodash/get'
import React, { CSSProperties, UIEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Empty, Tabs, Typography } from 'antd'
import styled from '@emotion/styled'

import { useIntl } from '@open-condo/next/intl'
import { TicketComment, TicketUpdateInput, TicketCommentFile, Ticket } from '@app/condo/schema'

import { colors, shadows, fontSizes } from '@condo/domains/common/constants/style'
import { ORGANIZATION_COMMENT_TYPE, RESIDENT_COMMENT_TYPE } from '@condo/domains/ticket/constants'
import { hasUnreadResidentComments } from '@condo/domains/ticket/utils/helpers'
import { Loader } from '../Loader'

import { Module } from '../MultipleFileUpload'
import { useLayoutContext } from '../LayoutContext'
import { Comment } from './Comment'
import { CommentForm } from './CommentForm'

interface IContainerProps {
    isSmall: boolean
}

const Container = styled.aside<IContainerProps>`
  background: ${colors.backgroundLightGrey};
  border-radius: 8px;
  
  ${({ isSmall }) => {
        if (isSmall) {
            return 'margin: 0 -20px -60px;'
        } else {
            return 'height: calc(100vh - 100px);'
        }
    }}

  display: flex;
  flex-flow: column nowrap;
  align-content: space-between;
`
const Head = styled.div<{ isTitleHidden: boolean }>`
  padding: 24px 24px 0 24px;
  display: ${({ isTitleHidden }) => isTitleHidden ? 'none' : 'block'};
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 28px;
`
const Body = styled.div`
  padding: 12px 24px 0;
  overflow-y: scroll;
  flex: 1 1 auto;
`
const Footer = styled.div<{ isSmall: boolean }>`
  .ant-form {
    padding-right: ${({ isSmall }) => isSmall ? '60px' : '0'};
  }
  
  border-top: 1px solid ${colors.inputBorderGrey};
  padding: 8px;
`
const EmptyContainer = styled.div`
  text-align: center;
  flex: 1 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .ant-empty-image {
    display: none;
  }
`

type ActionsForComment = {
    updateAction?: (values: Partial<TicketUpdateInput>, obj: TicketComment) => Promise<TicketComment>,
    deleteAction?: (obj: TicketComment) => Promise<TicketComment>,
}

const { TabPane } = Tabs

const CommentsTabsContainer = styled.div<{ isTitleHidden: boolean }>`
    padding: 0;
    display: flex;
    flex: 1 1 auto;

    height: calc(100vh - 508px);
    overflow-y: scroll;
  
    .ant-tabs-card.ant-tabs {
      flex: 1 1 auto;
      width: 100%;

      & > .ant-tabs-nav {
        background-color: ${colors.backgroundLightGrey};
        padding: 28px 0;
        border-bottom: 1px solid ${colors.inputBorderGrey};
        margin: 0;
        border-radius: ${({ isTitleHidden }) => isTitleHidden ? '8px' : '0'};
        
        .ant-tabs-tab {
          border: none;
          background-color: transparent;
          padding: 9px 20px;
          border-radius: 4px;
          
          .ant-tabs-tab-btn {
            display: flex;
          }

          &.ant-tabs-tab-active {
            background-color: white;
            box-shadow: ${shadows.main};
          }
        }
      }
      
      & > .ant-tabs-content-holder {
        display: flex;
        
        .ant-tabs-content.ant-tabs-content-top {
          display: flex;
          flex: 1 1;
          
          .ant-tabs-tabpane {
            display: flex;
          }
        }
      }
    }
`

const EMPTY_CONTAINER_TEXT_STYLES: CSSProperties = { fontSize: fontSizes.content }
const LOADER_STYLES: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0 18px 0' }

const EmptyCommentsContainer = ({ PromptTitleMessage, PromptDescriptionMessage }) => (
    <EmptyContainer>
        <Empty
            image={null}
            description={
                <>
                    <Typography.Paragraph strong style={EMPTY_CONTAINER_TEXT_STYLES}>
                        {PromptTitleMessage}
                    </Typography.Paragraph>
                    <Typography.Paragraph type='secondary' style={EMPTY_CONTAINER_TEXT_STYLES}>
                        {PromptDescriptionMessage}
                    </Typography.Paragraph>
                </>
            }
        />
    </EmptyContainer>
)

type CommentsTabContentProps = {
    comments: CommentWithFiles[],
    PromptTitleMessage: string,
    PromptDescriptionMessage: string,
    actionsFor: (comment: CommentWithFiles) => ActionsForComment,
    editableComment: CommentWithFiles
    setEditableComment: React.Dispatch<React.SetStateAction<CommentWithFiles>>
    handleBodyScroll: UIEventHandler<HTMLDivElement>
    bodyRef: React.RefObject<HTMLDivElement>
    sending: boolean
}

const CommentsTabContent: React.FC<CommentsTabContentProps> =
    ({ sending, handleBodyScroll, bodyRef, comments, PromptTitleMessage, PromptDescriptionMessage, actionsFor, editableComment, setEditableComment }) => {
        const commentsToRender = useMemo(() =>
            comments
                .filter(comment => editableComment ? comment.id !== editableComment.id : true)
                .map(comment => {
                    const { deleteAction } = actionsFor(comment)

                    return (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            deleteAction={deleteAction}
                            setEditableComment={setEditableComment}
                        />
                    )
                }), [actionsFor, comments, editableComment, setEditableComment])

        return (
            <>
                {comments.length === 0 ? (
                    <EmptyCommentsContainer
                        PromptTitleMessage={PromptTitleMessage}
                        PromptDescriptionMessage={PromptDescriptionMessage}
                    />
                ) : (
                    <Body ref={bodyRef} onScroll={handleBodyScroll}>
                        {sending && <Loader style={LOADER_STYLES} />}
                        {commentsToRender}
                    </Body>
                )}
            </>
        )
    }

const SCROLL_TOP_OFFSET_TO_HIDE_TITLE = 30
const COMMENTS_COUNT_STYLES: CSSProperties = { padding: '2px', fontSize: '8px' }
const NewCommentIndicator = styled.div`
    position: relative;
    top: 5px;
    width: 4px; 
    height: 4px; 
    border-radius: 100px; 
    background-color: ${colors.red[5]};
`

const CommentsTabPaneLabel = ({ label, commentsCount, newCommentsIndicator }) => (
    <>
        <Typography.Text>
            {label}
        </Typography.Text>
        <Typography.Text style={COMMENTS_COUNT_STYLES}>
            {commentsCount}
        </Typography.Text>
        {
            newCommentsIndicator && (
                <NewCommentIndicator title='' />
            )
        }
    </>
)

export type CommentWithFiles = TicketComment & {
    files: Array<TicketCommentFile> | null
}

interface ICommentsListProps {
    ticket: Ticket,
    comments: CommentWithFiles[],
    createAction?: (formValues) => Promise<TicketComment>,
    updateAction?: (attrs, obj: CommentWithFiles) => Promise<TicketComment>
    // Place for abilities check. If action of given type is not returned, appropriate button will not be displayed
    actionsFor: (comment: CommentWithFiles) => ActionsForComment,
    canCreateComments: boolean,
    refetchComments,
    FileModel: Module,
    ticketCommentsTime
    fileModelRelationField: string,
    userTicketCommentReadTime,
    createUserTicketCommentReadTime,
    updateUserTicketCommentReadTime,
    loadingUserTicketCommentReadTime: boolean
}

const Comments: React.FC<ICommentsListProps> = ({
    ticket,
    comments,
    createAction,
    updateAction,
    refetchComments,
    canCreateComments,
    actionsFor,
    FileModel,
    fileModelRelationField,
    ticketCommentsTime,
    userTicketCommentReadTime,
    createUserTicketCommentReadTime,
    updateUserTicketCommentReadTime,
    loadingUserTicketCommentReadTime,
}) => {
    const intl = useIntl()
    const TitleMessage = intl.formatMessage({ id: 'Comments.title' })
    const CannotCreateCommentsMessage = intl.formatMessage({ id: 'Comments.cannotCreateComments' })
    const InternalCommentsMessage = intl.formatMessage({ id: 'Comments.tab.organization' })
    const PromptInternalCommentsTitleMessage = intl.formatMessage({ id: 'Comments.tab.organization.prompt.title' })
    const PromptInternalCommentsDescriptionMessage = intl.formatMessage({ id: 'Comments.tab.organization.prompt.description' })
    const ResidentCommentsMessage = intl.formatMessage({ id: 'Comments.tab.resident' })
    const PromptResidentCommentsTitleMessage = intl.formatMessage({ id: 'Comments.tab.resident.prompt.title' })
    const PromptResidentCommentsDescriptionMessage = intl.formatMessage({ id: 'Comments.tab.resident.prompt.description' })

    const { isSmall } = useLayoutContext()
    const [commentType, setCommentType] = useState(ORGANIZATION_COMMENT_TYPE)
    const [editableComment, setEditableComment] = useState<CommentWithFiles>()
    const [sending, setSending] = useState(false)
    const [isTitleHidden, setTitleHidden] = useState<boolean>(false)
    const [isInitialUserTicketCommentReadTimeSet, setIsInitialUserTicketCommentReadTimeSet] = useState<boolean>(false)

    const handleBodyScroll = useCallback((e) => {
        const scrollTop = get(e, ['currentTarget', 'scrollTop'])

        if (scrollTop > SCROLL_TOP_OFFSET_TO_HIDE_TITLE && !isTitleHidden) {
            setTitleHidden(true)
        } else if (scrollTop === 0 && isTitleHidden) {
            setTitleHidden(false)
        }
    }, [isTitleHidden, setTitleHidden])

    const bodyRef = useRef(null)
    const scrollToBottom = () => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = 0
        }
    }

    useEffect(() => {
        setEditableComment(null)
    }, [commentType])

    const commentsWithOrganization = useMemo(() => comments.filter(comment => comment.type === ORGANIZATION_COMMENT_TYPE), [comments])
    const commentsWithResident = useMemo(() => comments.filter(comment => comment.type === RESIDENT_COMMENT_TYPE), [comments])

    const handleCommentAction = useCallback(async (values, syncModifiedFiles) => {
        if (editableComment) {
            await updateAction(values, editableComment)
            await syncModifiedFiles(editableComment.id)
            setEditableComment(null)
        } else {
            const comment = await createAction({ ...values, type: commentType })
            await syncModifiedFiles(comment.id)
            scrollToBottom()
        }

        await refetchComments()
    },
    [commentType, createAction, editableComment, refetchComments, updateAction])

    const createOrUpdateUserTicketCommentReadTime = useCallback((payload) => {
        if (loadingUserTicketCommentReadTime) return

        if (userTicketCommentReadTime) {
            updateUserTicketCommentReadTime({
                ...payload,
            }, userTicketCommentReadTime)
        } else {
            createUserTicketCommentReadTime({
                ...payload,
            })
        }
    }, [createUserTicketCommentReadTime, loadingUserTicketCommentReadTime, updateUserTicketCommentReadTime, userTicketCommentReadTime])

    useEffect(() => {
        if (!loadingUserTicketCommentReadTime && !isInitialUserTicketCommentReadTimeSet) {
            const now = new Date()
            createOrUpdateUserTicketCommentReadTime({
                readCommentAt: now,
            })

            setIsInitialUserTicketCommentReadTimeSet(true)
        }
    }, [createOrUpdateUserTicketCommentReadTime, isInitialUserTicketCommentReadTimeSet, loadingUserTicketCommentReadTime])

    const handleTabChange = useCallback((tab) => {
        setCommentType(tab)
        const now = new Date()

        if (tab === RESIDENT_COMMENT_TYPE) {
            createOrUpdateUserTicketCommentReadTime({
                readResidentCommentAt: now,
                readCommentAt: now,
            })
        } else if (tab === ORGANIZATION_COMMENT_TYPE) {
            createOrUpdateUserTicketCommentReadTime({
                readCommentAt: now,
            })
        }

        scrollToBottom()
    }, [createOrUpdateUserTicketCommentReadTime])

    const lastResidentCommentAt = get(ticketCommentsTime, 'lastResidentCommentAt')
    const lastCommentAt = get(ticketCommentsTime, 'lastCommentAt')
    const readResidentCommentByUserAt = get(userTicketCommentReadTime, 'readResidentCommentAt')
    const showIndicator = useMemo(() => hasUnreadResidentComments(lastResidentCommentAt, readResidentCommentByUserAt, lastCommentAt),
        [lastCommentAt, lastResidentCommentAt, readResidentCommentByUserAt])

    return (
        <Container isSmall={isSmall}>
            <Head isTitleHidden={isTitleHidden}>{TitleMessage}</Head>
            <CommentsTabsContainer isTitleHidden={isTitleHidden} className='card-container'>
                <Tabs
                    defaultActiveKey={ORGANIZATION_COMMENT_TYPE}
                    centered
                    type='card'
                    tabBarGutter={4}
                    onChange={handleTabChange}
                >
                    <TabPane
                        tab={
                            <CommentsTabPaneLabel
                                newCommentsIndicator={false}
                                label={InternalCommentsMessage}
                                commentsCount={commentsWithOrganization.length}
                            />
                        }
                        key={ORGANIZATION_COMMENT_TYPE}
                    >
                        <CommentsTabContent
                            comments={commentsWithOrganization}
                            PromptTitleMessage={PromptInternalCommentsTitleMessage}
                            PromptDescriptionMessage={PromptInternalCommentsDescriptionMessage}
                            actionsFor={actionsFor}
                            editableComment={editableComment}
                            setEditableComment={setEditableComment}
                            handleBodyScroll={handleBodyScroll}
                            bodyRef={bodyRef}
                            sending={sending}
                        />
                    </TabPane>
                    <TabPane
                        tab={
                            <CommentsTabPaneLabel
                                label={ResidentCommentsMessage}
                                commentsCount={commentsWithResident.length}
                                newCommentsIndicator={showIndicator}
                            />
                        }
                        key={RESIDENT_COMMENT_TYPE}
                    >
                        <CommentsTabContent
                            comments={commentsWithResident}
                            PromptTitleMessage={PromptResidentCommentsTitleMessage}
                            PromptDescriptionMessage={PromptResidentCommentsDescriptionMessage}
                            actionsFor={actionsFor}
                            editableComment={editableComment}
                            setEditableComment={setEditableComment}
                            handleBodyScroll={handleBodyScroll}
                            bodyRef={bodyRef}
                            sending={sending}
                        />
                    </TabPane>
                </Tabs>
            </CommentsTabsContainer>
            <Footer isSmall={isSmall}>
                {canCreateComments ? (
                    <CommentForm
                        ticket={ticket}
                        FileModel={FileModel}
                        relationField={fileModelRelationField}
                        action={handleCommentAction}
                        editableComment={editableComment}
                        setEditableComment={setEditableComment}
                        setSending={setSending}
                        sending={sending}
                    />
                ) : (
                    <Typography.Text disabled>{CannotCreateCommentsMessage}</Typography.Text>
                )}
            </Footer>
        </Container>
    )
}

Comments.defaultProps = {
    comments: [],
}

export { Comments }
