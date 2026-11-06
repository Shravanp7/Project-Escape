import { Button } from "@/components/ui/button";
import { RotateCcw, LogOut } from "lucide-react";
import { Starfield } from "./Starfield";
import { ARTWORK } from "./artwork";

export function ExitScreen({ onReplay, onExit }: { onReplay: () => void; onExit: () => void }) {
  return (
    <section className="victory-screen fixed inset-0 z-[60] flex flex-col items-center justify-center-safe overflow-x-hidden overflow-y-auto bg-background px-6 py-20 text-center" aria-label="Escape complete">
      <Starfield victory />
      <div className="relative flex max-w-lg flex-col items-center gap-6">
        <p className="font-pixel text-xs text-accent">GRAVITY WELL CLEARED</p>
        <h1 className="font-pixel text-2xl text-primary md:text-4xl">PROJECT ESCAPE</h1>
        <div className="exit-orbit relative flex h-28 items-center justify-center gap-5" aria-hidden="true">
          <span className="victory-ship relative h-16 w-16">
            <img src={ARTWORK.thruster} className="pixel-canvas h-16 w-16 object-contain" alt="" />
            <span className="victory-flame" />
          </span>
          <span className="relative h-20 w-20">
            <span className="exit-portal block" />
            <span className="victory-particles absolute inset-0">
              {Array.from({ length: 8 }, (_, i) => <i key={i} />)}
            </span>
          </span>
          <span className="victory-sparkles absolute inset-0">
            {Array.from({ length: 6 }, (_, i) => <i key={i} />)}
          </span>
        </div>
        <h2 className="victory-heading font-pixel text-xl text-success">ESCAPED!</h2>
        <p className="text-2xl text-foreground">Five sectors behind you. The ship is home.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="victory-button" variant="pixel" onClick={onReplay}><RotateCcw />Play again</Button>
          <Button className="victory-button" variant="pixel" onClick={onExit}><LogOut />Exit to launch</Button>
        </div>
      </div>
      <p className="absolute bottom-6 px-4 text-lg text-muted-foreground">Made by Shravan Patil and Anshul Patil</p>
    </section>
  );
}