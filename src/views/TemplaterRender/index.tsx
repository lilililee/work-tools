import { useState, SyntheticEvent, useEffect } from 'react'
// import Editor from '@monaco-editor/react'
import { Typography, Row, Col, Card, Input, Form } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useLocalStorageState } from 'ahooks'
import MonacoEditor from '../../components/MonacoEditor'
// import AceEditor from '../../components/AceEditor'
const { Title } = Typography
const { TextArea } = Input

type TemplaterData = Record<string, string>

function TemplaterRender() {
  const [templateInput, setTemplateInput] = useState('')
  const [templateOutput, setTemplateOutput] = useState('')
  const [fieldList, setFieldList] = useState([] as string[])
  const [localTemplateData, setLocalTemplateData] = useLocalStorageState('TemplaterRenderDataRecord', {
    defaultValue: {} as TemplaterData
  })

  const [form] = Form.useForm()
  const initForm = (fieldList: string[]) => {
    const values = fieldList.reduce(
      (prev: TemplaterData, field: string) => ({
        ...prev,
        [field]: localTemplateData?.[field] || ''
      }),
      {}
    )
    form.setFieldsValue(values)
    onValuesChange({}, values)
  }

  // 找出需要设置数据的字段
  const onTemplateChange = (e: any) => {
    setTemplateInput(e.target.value)
  }

  useEffect(() => {
    const pattern = /\{(.+?)\}/g
    const matchRes = templateInput.match(pattern) || []
    const matchFieldList = matchRes.map((field: string) => field.slice(1, -1).trim())
    const list = [...new Set(matchFieldList)] as string[]
    setFieldList(list)
    initForm(list)
  }, [templateInput])

  const onValuesChange = (changedFields: TemplaterData, templateData: TemplaterData) => {
    // 根据模版和数据生成内容
    let output = templateInput
    Object.keys(templateData).forEach((key) => {
      output = output.replace(new RegExp(`{${key}}`, 'g'), templateData[key])
    })
    setTemplateOutput(output)

    // 持久化数据
    setLocalTemplateData({
      ...localTemplateData,
      ...templateData
    })
  }

  return (
    <div className="page templater-render">
      <Row justify="center">
        <Title level={3}>模版字符串渲染器</Title>
      </Row>

      <Row>
        <Col span={11}>
          <Card title="输入" bordered={false}>
            {/* <MonacoEditor></MonacoEditor> */}
            {/* <AceEditor></AceEditor> */}
            {/* <Editor height="90vh" defaultLanguage="javascript" defaultValue="// some comment" onChange={handleEditorChange} /> */}
            <TextArea value={templateInput} placeholder="请输入" autoSize={{ minRows: 18, maxRows: 18 }} onChange={(e: any) => setTemplateInput(e.target.value)} />
          </Card>
        </Col>
        <Col span={2}>
          <Row justify="center" align="middle" style={{ height: '100%' }}>
            <ArrowRightOutlined style={{ fontSize: '36px', color: '#0092ff' }} />
          </Row>
        </Col>
        <Col span={11}>
          <Card title="输出" bordered={false}>
            <TextArea value={templateOutput} placeholder="" autoSize={{ minRows: 18, maxRows: 18 }} onChange={onTemplateChange} />
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Card title="数据设置" bordered={false}>
            <Form name="basic" form={form} labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} onValuesChange={onValuesChange}>
              <Row>
                {fieldList.map((field: string) => (
                  <Col span={6} key={field} style={{ marginTop: 4 }}>
                    <Form.Item label={field} name={field} rules={[{ required: true, message: `请输入 ${field}` }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default TemplaterRender
