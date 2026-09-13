import Link from "next/link";
import { MonitorPlay, Smartphone } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#ff4e0055,transparent_46%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-4 py-10 sm:px-8">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <BrandLogo width={640} priority className="w-full max-w-[34rem]" />
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-show-cream/80">
            Dve družstvá, jedna otázka, päť odpovedí z prieskumu. Hraciu
            plochu nechajte na televízore. Moderátor na telefóne odhaľuje
            odpovede a pripočítava body.
          </p>
        </div>

        <div className="grid w-full gap-4 md:grid-cols-2">
          <Card className="border-show-orange/40 bg-show-ink/70">
            <CardHeader>
              <MonitorPlay className="size-8 text-show-yellow" />
              <CardTitle className="font-heading text-3xl">Hracia plocha</CardTitle>
              <CardDescription className="text-base text-show-cream/70">
                Otázka je viditeľná. Päť políčok ostáva zatvorených, kým ich
                moderátor neotvorí.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/play" className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>
                Otvoriť tabuľu
              </Link>
            </CardContent>
          </Card>

          <Card className="border-show-purple/45 bg-show-ink/70">
            <CardHeader>
              <Smartphone className="size-8 text-show-magenta" />
              <CardTitle className="font-heading text-3xl">Moderátor</CardTitle>
              <CardDescription className="text-base text-show-cream/70">
                Listujte otázky, vyberte, ktoré odpovede sa ukážu, a body
                pošlite prvému alebo druhému družstvu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin" className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>
                Otvoriť pult
              </Link>
            </CardContent>
          </Card>
        </div>

        <ol className="grid w-full gap-3 text-sm text-show-cream/70 sm:grid-cols-3">
          <li className="rounded-2xl border border-show-yellow/20 bg-show-ink/50 p-4">
            <span className="font-heading text-show-yellow">1.</span> Tabuľa na
            veľkej obrazovke, pult na druhom zariadení.
          </li>
          <li className="rounded-2xl border border-show-yellow/20 bg-show-ink/50 p-4">
            <span className="font-heading text-show-yellow">2.</span> Hráči hádajú.
            Moderátor ťukne na správnu odpoveď a tá sa objaví na tabuli.
          </li>
          <li className="rounded-2xl border border-show-yellow/20 bg-show-ink/50 p-4">
            <span className="font-heading text-show-yellow">3.</span> Na konci kola
            pripočítajte body družstvu A alebo B.
          </li>
        </ol>
      </div>
    </main>
  );
}
