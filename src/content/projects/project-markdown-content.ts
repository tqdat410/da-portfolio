import aiQuickNote from "./ai-quick-note.md";
import customNotificationCenter from "./custom-notification-center.md";
import hengout from "./hengout.md";
import koiVetCenter from "./koi-vet-center.md";
import uniEventManager from "./uni-event-manager.md";

export const PROJECT_MARKDOWN_FILES: ReadonlyArray<{ fileName: string; raw: string }> = [
  { fileName: "custom-notification-center.md", raw: customNotificationCenter },
  { fileName: "hengout.md", raw: hengout },
  { fileName: "koi-vet-center.md", raw: koiVetCenter },
  { fileName: "uni-event-manager.md", raw: uniEventManager },
  { fileName: "ai-quick-note.md", raw: aiQuickNote },
];
