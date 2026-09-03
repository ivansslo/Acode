import { Decoration, DecorationSet, ViewPlugin, WidgetType, EditorView, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

class NewlineWidget extends WidgetType {
	toDOM(): HTMLElement {
		const span = document.createElement("span");
		span.textContent = "¬";
		span.className = "cm-newline-marker";
		return span;
	}
	eq(other: WidgetType): boolean {
		return other instanceof NewlineWidget;
	}
}

// Optimization: Reuse a single static widget and decoration instance to prevent
// allocating hundreds of NewlineWidget and Decoration objects per viewport update.
const newlineWidget = new NewlineWidget();
const newlineDeco = Decoration.widget({
	widget: newlineWidget,
	side: 1,
});

export const lineBreakMarkerPlugin = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = this.getDecorations(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged) {
				this.decorations = this.getDecorations(update.view);
			}
		}

		getDecorations(view: EditorView): DecorationSet {
			const builder = new RangeSetBuilder<Decoration>();
			const doc = view.state.doc;
			const totalLines = doc.lines;
			let lastLineNumber = -1;

			// Optimization: Iterate line numbers directly from startLine to endLine
			// instead of repeatedly resolving position coordinates with doc.lineAt(pos).
			for (const { from, to } of view.visibleRanges) {
				const startLine = doc.lineAt(from).number;
				const endLine = doc.lineAt(to).number;

				for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
					if (lineNum > lastLineNumber && lineNum < totalLines) {
						const line = doc.line(lineNum);
						builder.add(line.to, line.to, newlineDeco);
						lastLineNumber = lineNum;
					}
				}
			}
			return builder.finish();
		}
	},
	{
		decorations: (v) => v.decorations,
	},
);

export const lineBreakMarkerTheme = EditorView.theme({
	".cm-newline-marker": {
		color: "var(--cm-space-marker-color, rgba(127, 127, 127, 0.6))",
		pointerEvents: "none",
		userSelect: "none",
	},
});

export const lineBreakMarker = [lineBreakMarkerPlugin, lineBreakMarkerTheme];

export default lineBreakMarker;
