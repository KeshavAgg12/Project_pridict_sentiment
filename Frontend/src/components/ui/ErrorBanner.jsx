export default function ErrorBanner({ message, hasData }) {
  return (
    <div role="alert" className="mb-5 border-2 border-orange bg-panel p-3 text-sm">
      Could not load data ({message}). {hasData ? 'Showing the last data received. ' : ''}
      Check that node server.js is running on port 9000.
    </div>
  )
}
