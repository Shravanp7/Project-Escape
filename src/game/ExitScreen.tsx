import { Button } from "@/components/ui/button";
import { RotateCcw, LogOut } from "lucide-react";
import { Starfield } from "./Starfield";
import { StationScene } from "./StationScene";

export function ExitScreen({ onReplay, onExit }: { onReplay: () => void; onExit: () => void }) {
  return (
    <section className="victory-screen fixed inset-0 z-[60] flex flex-col items-center justify-center-safe overflow-x-hidden overflow-y-auto bg-background px-6 py-20 text-center" aria-label="Escape complete">
      <Starfield victory />
      <div className="relative flex max-w-lg flex-col items-center gap-6">
        <p className="font-pixel text-xs text-accent">GRAVITY WELL CLEARED</p>
        <h1 className="font-pixel text-2xl text-primary md:text-4xl">PROJECT ESCAPE</h1>
        <div className="relative" aria-hidden="true">
          <StationScene />
          <span className="victory-sparkles absolute inset-0">
            {Array.from({ length: 6 }, (_, i) => <i key={i} />)}
          </span>
        </div>
        <h2 className="victory-heading font-pixel text-xl text-success">LEVEL COMPLETE!</h2>
        <p className="font-pixel text-sm text-primary">MISSION ACCOMPLISHED!</p>
        <p className="text-2xl text-foreground">Five sectors behind you. The ship is finally home.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="victory-button font-pixel" variant="pixel" onClick={onReplay}><RotateCcw className="fill-current" />PLAY AGAIN</Button>
          <Button className="victory-button font-pixel" variant="pixel" onClick={onExit}><LogOut />EXIT TO LAUNCH</Button>
        </div>
      </div>
      <p className="absolute bottom-6 px-4 text-lg text-muted-foreground">Made by Shravan Patil and Anshul Patil</p>
    </section>
  );
}
