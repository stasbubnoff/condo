import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from '@open-condo/next/intl'
import styled from '@emotion/styled'
import { Col, Form, FormInstance, Input, Row, Typography } from 'antd'
import get from 'lodash/get'

import { Button } from '@condo/domains/common/components/Button'
import { colors } from '@condo/domains/common/constants/style'
import { useValidations } from '@condo/domains/common/hooks/useValidations'
import { MAX_COMMENT_LENGTH } from '@condo/domains/ticket/constants'
import { useInputWithCounter } from '@condo/domains/common/hooks/useInputWithCounter'
import { FormWithAction } from '@condo/domains/common/components/containers/FormList'
import { ClipIcon } from '@condo/domains/common/components/icons/ClipIcon'
import { Module, useMultipleFileUploadHook } from '@condo/domains/common/components/MultipleFileUpload'
import { getIconByMimetype } from '@condo/domains/common/utils/clientSchema/files'

import { CommentWithFiles } from './index'

const Holder = styled.div`
  .wrapper {
    position: relative;

    button.ant-btn {
      position: absolute;
      right: 8px;
      top: 2px;
      padding: 0;
    }
  }
  
  .ant-form-item-explain {
    display: none;
  }
  textarea {
    padding-right: 45px;
  }
  
  .ant-upload-list.ant-upload-list-text {
    max-height: 15vh;
    overflow-y: scroll;
    
    .ant-upload-list-item-done, .ant-upload-list-item-error {
      height: auto;
    }
  }
`

const ENTER_KEY_CODE = 13
const COMMENT_HELPERS_ROW_STYLES: CSSProperties = { padding: '0 8px 8px 8px' }
const INPUT_WITH_COUNTER_AUTOSIZE_CONFIG = { minRows: 1, maxRows: 6 }

const CommentHelperWrapper = styled(Col)`
  background-color: ${colors.textSecondary};
  padding: 2px 10px 4px;
  margin: 2px;
  border-radius: 100px;

  .ant-typography {
    color: ${colors.white};
    font-weight: 600;
  }
`

interface ICommentFormProps {
    ticket
    action: (formValues, syncModifiedFiles) => Promise<any>
    fieldName?: string
    initialValue?: string
    editableComment: CommentWithFiles
    setEditableComment: React.Dispatch<React.SetStateAction<CommentWithFiles>>
    sending: boolean
    FileModel: Module,
    relationField: string
    setSending: React.Dispatch<React.SetStateAction<boolean>>
}

const CommentForm: React.FC<ICommentFormProps> = ({
    ticket,
    initialValue,
    action,
    fieldName,
    editableComment,
    sending,
    FileModel,
    relationField,
    setSending,
}) => {
    const intl = useIntl()
    const PlaceholderMessage = intl.formatMessage({ id: 'Comments.form.placeholder' })
    const HelperMessage = intl.formatMessage({ id: 'Comments.form.helper' })

    const { InputWithCounter, Counter, setTextLength: setCommentLength, textLength: commentLength } = useInputWithCounter(Input.TextArea, MAX_COMMENT_LENGTH)
    const [form, setForm] = useState<FormInstance>()

    const editableCommentFiles = get(editableComment, 'files')
    const { UploadComponent, syncModifiedFiles, resetModifiedFiles, filesCount } = useMultipleFileUploadHook({
        Model: FileModel,
        relationField: relationField,
        initialFileList: editableCommentFiles,
        initialCreateValues: { ticket: { connect: { id: ticket.id } } },
        dependenciesForRerenderUploadComponent: [editableComment],
    })

    useEffect(() => {
        if (editableComment && form) {
            const editableCommentContent = editableComment.content

            form.setFieldsValue({ [fieldName]: editableCommentContent })
            setCommentLength(get(editableCommentContent, 'length', 0))
        }
    }, [editableComment, fieldName, form, setCommentLength])

    const handleKeyUp = useCallback(async (event, form) => {
        if (event.keyCode === ENTER_KEY_CODE && !event.shiftKey) {
            const content = form.getFieldValue(fieldName)
            if (content && content.trim().length > 0 || filesCount > 0) {
                setSending(true)
            }

            form.submit()
            setCommentLength(0)
        }
    }, [fieldName, filesCount, setCommentLength, setSending])

    const handleKeyDown = useCallback((event) => {
        if (event.keyCode === ENTER_KEY_CODE) {
            event.preventDefault()
        }
    }, [])

    const { requiredValidator, trimValidator } = useValidations()

    const validations = useMemo(() => ({
        comment: filesCount > 0 ? [] : [requiredValidator, trimValidator],
    }), [filesCount, requiredValidator, trimValidator])

    const actionWithSyncComments = useCallback(async (values) => {
        values.content = form.getFieldValue(fieldName)
        form.setFieldsValue({ [fieldName]: null })

        await action(values, syncModifiedFiles)
        await resetModifiedFiles()
        setSending(false)
    }, [action, fieldName, form, resetModifiedFiles, setSending, syncModifiedFiles])

    const MemoizedUploadComponent = useCallback(() => (
        <UploadComponent
            initialFileList={editableCommentFiles}
            UploadButton={
                <Button type='text'>
                    <ClipIcon />
                </Button>
            }
            uploadProps={{
                iconRender: (file) => {
                    return getIconByMimetype(file.type)
                },
            }}
        />
    ), [UploadComponent, editableComment, sending])

    const initialCommentFormValues = useMemo(() => ({
        [fieldName]: initialValue,
    }), [fieldName, initialValue])

    const showHelperMessage = useMemo(() => commentLength > 0 || editableComment, [commentLength, editableComment])

    return (
        <FormWithAction
            initialValues={initialCommentFormValues}
            action={actionWithSyncComments}
            resetOnComplete={true}
        >
            {({ form: formInstance }) => {
                if (!form) {
                    setForm(formInstance)
                }

                return (
                    <Holder>
                        {
                            showHelperMessage && (
                                <Row justify='space-between' style={COMMENT_HELPERS_ROW_STYLES}>
                                    <CommentHelperWrapper>
                                        <Typography.Text>
                                            {HelperMessage}
                                        </Typography.Text>
                                    </CommentHelperWrapper>
                                    <CommentHelperWrapper>
                                        <Counter />
                                    </CommentHelperWrapper>
                                </Row>
                            )
                        }
                        <div className='wrapper'>
                            <Form.Item
                                name={fieldName}
                                rules={validations.comment}
                            >
                                <InputWithCounter
                                    maxLength={MAX_COMMENT_LENGTH}
                                    placeholder={PlaceholderMessage}
                                    className='white'
                                    autoSize={INPUT_WITH_COUNTER_AUTOSIZE_CONFIG}
                                    onKeyDown={handleKeyDown}
                                    onKeyUp={(event) => {handleKeyUp(event, form)}}
                                />
                            </Form.Item>
                            <MemoizedUploadComponent />
                        </div>
                    </Holder>
                )
            }}
        </FormWithAction>
    )
}

CommentForm.defaultProps = {
    fieldName: 'content',
    initialValue: '',
}

export {
    CommentForm,
}