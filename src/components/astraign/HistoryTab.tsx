import { useState } from "react";
import { FileText, Share2, Copy, Check } from "lucide-react";
import { useHistory } from "@/context/HistoryContext";
import { format } from "date-fns";

export default function HistoryTab() {
  const { entries, clearHistory } = useHistory();
  const [copied, setCopied] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const exportText = entries
    .map(
      (e) =>
        `[${format(e.timestamp, "PPp")}]\nSpoken: ${e.audioText}\nASL: ${e.aslTranslation}\n`
    )
    .join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `astrasign-transcript-${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      handleCopy();
      setExportOpen(false);
      return;
    }
    try {
      const blob = new Blob([exportText], { type: "text/plain" });
      const file = new File([blob], "transcript.txt", { type: "text/plain" });
      await navigator.share({
        title: "AstraSign Transcript",
        files: [file],
      });
      setExportOpen(false);
    } catch {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium tracking-wider">
              CONVERSATION LOG
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            History
          </h2>
        </div>
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-subtle border border-primary/25 text-primary text-sm font-medium transition-all duration-200 hover:bg-accent-subtle/80"
          >
            <FileText size={16} />
            Export
          </button>
          {exportOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setExportOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg overflow-hidden py-1 min-w-[180px] shadow-lg">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-secondary transition-colors"
                >
                  <FileText size={16} className="text-muted-foreground" />
                  Download .txt
                </button>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-secondary transition-colors"
                >
                  <Share2 size={16} className="text-muted-foreground" />
                  Share link
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-secondary transition-colors"
                >
                  {copied ? (
                    <Check size={16} className="text-primary" />
                  ) : (
                    <Copy size={16} className="text-muted-foreground" />
                  )}
                  {copied ? "Copied!" : "Copy to clipboard"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-xl bg-accent-subtle border border-primary/25 flex items-center justify-center">
              <FileText size={28} className="text-primary" />
            </div>
            <p className="text-muted-foreground text-center">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-[240px]">
              Use the Translate tab to start. Your history will appear here.
            </p>
          </div>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="space-y-2">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl rounded-bl-md px-4 py-3 bg-secondary border border-border">
                  <p className="text-sm text-foreground">{e.audioText}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {format(e.timestamp, "p")}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl rounded-br-md px-4 py-3 bg-accent-subtle border border-primary/20">
                  <p className="text-sm text-foreground">{e.aslTranslation}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {format(e.timestamp, "p")}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {entries.length > 0 && (
        <button
          onClick={clearHistory}
          className="mt-4 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear history
        </button>
      )}
    </div>
  );
}
