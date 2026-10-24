import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { PopoverContent } from "./ui/popover";
import { DEMO_TOUR_KEY, shouldShowDemoTour } from "@/lib/demo-tour";

const steps = [
  { title: "Cadastre um produto", text: "Preencha o nome, os preços e o marketplace neste formulário para calcular uma nova venda.", selector: "#name" },
  { title: "Confira o lucro", text: "Este exemplo já está calculado. Veja o lucro líquido e a conta passo a passo, com cada custo descontado uma vez.", selector: "[data-demo-profit] p" },
  { title: "Análise por IA", text: "Informe o nome e a categoria no formulário e use este botão para solicitar a análise do produto.", selector: "ai" },
  { title: "Histórico de produtos", text: "Os quatro exemplos estão aqui. Clique em um produto para comparar os custos e o lucro de cada marketplace.", selector: "[data-demo-history] h3" },
];

export function DemoTour({ email }: { email?: string }) {
  const [open, setOpen] = useState(() => shouldShowDemoTour(email, localStorage.getItem(DEMO_TOUR_KEY)));
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const step = steps[index];

  const finish = () => {
    localStorage.setItem(DEMO_TOUR_KEY, "true");
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const element = step.selector === "ai"
      ? Array.from(document.querySelectorAll<HTMLButtonElement>("[data-demo-product] button")).find(button => button.textContent?.includes("Iniciar Análise com IA"))
      : document.querySelector<HTMLElement>(step.selector);
    if (!element) return;
    element.scrollIntoView({ block: "center", behavior: "instant" });
    element.classList.add("outline", "outline-2", "outline-primary", "outline-offset-4");
    setTarget(element);
    return () => {
      element.classList.remove("outline", "outline-2", "outline-primary", "outline-offset-4");
    };
  }, [open, step]);

  if (!open || !target) return null;

  return (
    <Popover.Root open key={index}>
      <Popover.Anchor virtualRef={{ current: target }} />
      <PopoverContent
        role="dialog"
        aria-label="Tour da conta de demonstração"
        side="bottom"
        collisionPadding={16}
        updatePositionStrategy="always"
        className="z-[100] w-80 max-w-[calc(100vw-2rem)]"
        onOpenAutoFocus={event => event.preventDefault()}
        onInteractOutside={event => event.preventDefault()}
        onEscapeKeyDown={finish}
      >
        <Popover.Arrow className="fill-popover" />
        <p className="text-xs text-muted-foreground mb-2">Demonstração · {index + 1} de {steps.length}</p>
        <h2 className="font-bold mb-2">{step.title}</h2>
        <p className="text-sm text-muted-foreground">{step.text}</p>
        <div className="flex items-center justify-between gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={finish}>Pular</Button>
          <div className="flex gap-2">
            {index > 0 && <Button variant="outline" size="icon" aria-label="Passo anterior" onClick={() => setIndex(index - 1)}><ArrowLeft className="h-4 w-4" /></Button>}
            <Button size="sm" onClick={() => index === steps.length - 1 ? finish() : setIndex(index + 1)}>
              {index === steps.length - 1 ? "Concluir" : "Próximo"}<ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover.Root>
  );
}