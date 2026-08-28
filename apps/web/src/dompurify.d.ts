declare module 'dompurify' {
  interface DOMPurifyApi { sanitize(value: string): string }
  const DOMPurify: DOMPurifyApi
  export default DOMPurify
}
