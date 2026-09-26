export default function ImagePlaceholder({ label, className = '' }) {
  return (
    <div className={`placeholder-stripes grid h-full w-full place-items-center ${className}`}>
      <span className="font-mono text-[11px] text-[#8a80b8]">{label}</span>
    </div>
  );
}
