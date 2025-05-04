import { cn } from "@/lib/utils";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 shadow-sm card-hover", 
      className
    )}>
      <div className="w-12 h-12 rounded-lg bg-brand-purple/10 flex items-center justify-center mb-4">
        <Icon size={24} className="text-brand-purple" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-brand-textSecondary">{description}</p>
    </div>
  );
}