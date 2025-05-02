export default function RecipeGeneratorLogo({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const DEFAULT_HEIGHT = 36
  const DEFAULT_WIDTH = 36
  return (
    <div
      className={`inline-flex flex-row items-center gap-1 ${className || ''}`}
      {...rest}
    >
      <span className="text-3xl font-semibold text-black dark:text-white">
        Recipe
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={DEFAULT_HEIGHT}
        viewBox="0 -960 960 960"
        width={DEFAULT_WIDTH}
        fill="currentColor"
        className={className}
      >
        <path d="m175-120-56-56 410-410q-18-42-5-95t57-95q53-53 118-62t106 32q41 41 32 106t-62 118q-42 44-95 57t-95-5l-50 50 304 304-56 56-304-302-304 302Zm118-342L173-582q-54-54-54-129t54-129l248 250-128 128Z" />
      </svg>
      <span className="text-3xl font-semibold text-blue-500">Generator</span>
    </div>
  )
}
