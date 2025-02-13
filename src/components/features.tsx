import { Brain, Sparkles, Scale, History } from "lucide-react";

const features = [
  {
    name: "Multiple LLM Support",
    description: "Compare responses from GPT-4, Claude, and other leading language models side by side.",
    icon: Brain,
  },
  {
    name: "Accuracy Scoring",
    description: "Get detailed accuracy scores based on sophisticated evaluation algorithms.",
    icon: Scale,
  },
  {
    name: "Real-time Evaluation",
    description: "Evaluate responses instantly and get immediate feedback on performance.",
    icon: Sparkles,
  },
  {
    name: "Response History",
    description: "Keep track of all your evaluations and access them anytime.",
    icon: History,
  },
];

export function Features() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Evaluate Faster</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to evaluate LLM responses
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Reval provides a comprehensive suite of tools to help you compare and evaluate responses from different Language Models.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}