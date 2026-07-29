// 結構化資料（Schema.org JSON-LD）共用元件
// 用法：<JsonLd data={schemaObject} /> 或 <JsonLd data={[schemaA, schemaB]} />
export default function JsonLd({ data }) {
  const items = Array.isArray(data) ? data : [data]

  return (
    <>
      {items.filter(Boolean).map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON.stringify 已足夠，另外跳脫 < 避免提早關閉 script 標籤
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  )
}
