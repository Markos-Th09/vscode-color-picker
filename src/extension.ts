import * as vscode from 'vscode';
import Color from './color';
import parse from 'parse-css-color';

interface Match {
	color: vscode.Color;
	type: string;
	length: number;
	range: vscode.Range;
}

function parseColorString(color: string) {

	try {
		const p = parse(color);
		if (!p) { throw new Error('invalid color string'); }
		if (p.type === "rgb") {
			const r = p.values[0] as number;
			const g = p.values[1] as number;
			const b = p.values[2] as number;
			const a = p.alpha as number;

			return new vscode.Color(r / 255, g / 255, b / 255, a);
		} else {
			const h = p.values[0] as number;
			const s = p.values[1] as number;
			const l = p.values[2] as number;
			const a = p.alpha as number;
			const { r, g, b } = Color.fromHsl(h, s, l).toRgb();
			return new vscode.Color(r / 255, g / 255, b / 255, a);
		}

	} catch (e) {
		return null;
	}

}


function getPos(text: string, index: number): vscode.Position {

	const nMatches = Array.from(text.slice(0, index).matchAll(/\n/g));

	const lineNumber = nMatches.length;

	const characterIndex = index - nMatches[lineNumber - 1].index;


	return new vscode.Position(
		lineNumber,
		characterIndex - 1
	);
}


class Matcher {
	static getMatches(text: string): Match[] {
		const matches = text.matchAll(/(?<!-)(#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b|hsla?\(\s*(-?\d*(?:\.\d+)?(?:deg|rad|turn)?)\s*,\s*(-?\d*(?:\.\d+)?%)\s*,\s*(-?\d*(?:\.\d+)?%)\s*(?:,\s*(-?\d*(?:\.\d+)?%?)\s*)?\)|hsla?\(\s*(-?\d*(?:\.\d+)?(?:deg|rad|turn)?)\s*\s+(-?\d*(?:\.\d+)?%)\s+(-?\d*(?:\.\d+)?%)\s*(?:\s*\/\s*(-?\d*(?:\.\d+)?%?)\s*)?\)|rgba?\(\s*(-?\d*(?:\.\d+)?)\s*,\s*(-?\d*(?:\.\d+)?)\s*,\s*(-?\d*(?:\.\d+)?)\s*(?:,\s*(-?\d*(?:\.\d+)?%?)\s*)?\)|rgba?\(\s*(-?\d*(?:\.\d+)?%)\s*,\s*(-?\d*(?:\.\d+)?%)\s*,\s*(-?\d*(?:\.\d+)?%)\s*(?:,\s*(-?\d*(?:\.\d+)?%?)\s*)?\)|rgba?\(\s*(-?\d*(?:\.\d+)?)\s+(-?\d*(?:\.\d+)?)\s+(-?\d*(?:\.\d+)?)\s*(?:\s*\/\s*(-?\d*(?:\.\d+)?%?)\s*)?\)|rgba?\(\s*(-?\d*(?:\.\d+)?%)\s+(-?\d*(?:\.\d+)?%)\s+(-?\d*(?:\.\d+)?%)\s*(?:\s*\/\s*(-?\d*(?:\.\d+)?%?)\s*)?\)|\baliceblue\b|\bantiquewhite\b|\baqua\b|\baquamarine\b|\bazure\b|\bbeige\b|\bbisque\b|\bblack\b|\bblanchedalmond\b|\bblue\b|\bblueviolet\b|\bbrown\b|\bburlywood\b|\bcadetblue\b|\bchartreuse\b|\bchocolate\b|\bcoral\b|\bcornflowerblue\b|\bcornsilk\b|\bcrimson\b|\bcyan\b|\bdarkblue\b|\bdarkcyan\b|\bdarkgoldenrod\b|\bdarkgray\b|\bdarkgrey\b|\bdarkgreen\b|\bdarkkhaki\b|\bdarkmagenta\b|\bdarkolivegreen\b|\bdarkorange\b|\bdarkorchid\b|\bdarkred\b|\bdarksalmon\b|\bdarkseagreen\b|\bdarkslateblue\b|\bdarkslategray\b|\bdarkslategrey\b|\bdarkturquoise\b|\bdarkviolet\b|\bdeeppink\b|\bdeepskyblue\b|\bdimgray\b|\bdimgrey\b|\bdodgerblue\b|\bfirebrick\b|\bfloralwhite\b|\bforestgreen\b|\bfuchsia\b|\bgainsboro\b|\bghostwhite\b|\bgold\b|\bgoldenrod\b|\bgray\b|\bgrey\b|\bgreen\b|\bgreenyellow\b|\bhoneydew\b|\bhotpink\b|\bindianred\b|\bindigo\b|\bivory\b|\bkhaki\b|\blavender\b|\blavenderblush\b|\blawngreen\b|\blemonchiffon\b|\blightblue\b|\blightcoral\b|\blightcyan\b|\blightgoldenrodyellow\b|\blightgray\b|\blightgrey\b|\blightgreen\b|\blightpink\b|\blightsalmon\b|\blightseagreen\b|\blightskyblue\b|\blightslategray\b|\blightslategrey\b|\blightsteelblue\b|\blightyellow\b|\blime\b|\blimegreen\b|\blinen\b|\bmagenta\b|\bmaroon\b|\bmediumaquamarine\b|\bmediumblue\b|\bmediumorchid\b|\bmediumpurple\b|\bmediumseagreen\b|\bmediumslateblue\b|\bmediumspringgreen\b|\bmediumturquoise\b|\bmediumvioletred\b|\bmidnightblue\b|\bmintcream\b|\bmistyrose\b|\bmoccasin\b|\bnavajowhite\b|\bnavy\b|\boldlace\b|\bolive\b|\bolivedrab\b|\borange\b|\borangered\b|\borchid\b|\bpalegoldenrod\b|\bpalegreen\b|\bpaleturquoise\b|\bpalevioletred\b|\bpapayawhip\b|\bpeachpuff\b|\bperu\b|\bpink\b|\bplum\b|\bpowderblue\b|\bpurple\b|\brebeccapurple\b|\bred\b|\brosybrown\b|\broyalblue\b|\bsaddlebrown\b|\bsalmon\b|\bsandybrown\b|\bseagreen\b|\bseashell\b|\bsienna\b|\bsilver\b|\bskyblue\b|\bslateblue\b|\bslategray\b|\bslategrey\b|\bsnow\b|\bspringgreen\b|\bsteelblue\b|\btan\b|\bteal\b|\bthistle\b|\btomato\b|\bturquoise\b|\bviolet\b|\bwheat\b|\bwhite\b|\bwhitesmoke\b|\byellow\b|\byellowgreen\b|\btransparent\b)(?!-)/gi);
		return Array.from(matches).map(match => {
			const t = match[0];
			const length = t.length;
			let type: string;

			if (t.startsWith('hsl(')) { type = "hsl"; }
			else if (t.startsWith('hsla(')) { type = "hsla"; }
			else if (t.startsWith('rgb(')) { type = "rgb"; }
			else if (t.startsWith('rgba(')) { type = "rgba"; }
			else if (t.startsWith('#')) { type = "hex"; }
			else { type = "string"; }

			const range = new vscode.Range(
				getPos(text, match.index),
				getPos(text, match.index + t.length)
			);

			const col = parseColorString(t);



			if (col) {
				return {
					color: col,
					type,
					length,
					range
				} as Match;
			}
		});



	}
}



class Picker {

	constructor() {
		let subscriptions: vscode.Disposable[] = [];
		vscode.workspace.onDidChangeTextDocument(this._onDidChangeTextDocument, this, subscriptions);
		vscode.workspace.onDidChangeConfiguration(this._onDidChangeConfiguration, this, subscriptions);
		this.register();
	}


	private get languages() {
		return vscode.workspace.getConfiguration('vscode-color-picker').get('languages') as Array<string>;
	}

	private _onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
		const editor = vscode.window.activeTextEditor;
		const document = e.document;
		const text = document.getText();
	}

	private _onDidChangeConfiguration() {

	}

	private register() {
		this.languages.forEach(language => {
			vscode.languages.registerColorProvider(language, {
				provideDocumentColors(document: vscode.TextDocument, token: vscode.CancellationToken) {
					const matches = Matcher.getMatches(document.getText());
					return matches.map((match) => new vscode.ColorInformation(
						match.range,
						match.color
					));

				},
				provideColorPresentations(color, context, token) {
					const c = Color.fromRgb(color.red * 255, color.green * 255, color.blue * 255);
					c.alpha = color.alpha;
					const colString = context.document.getText(context.range);

					const presentationHex = new vscode.ColorPresentation(c.toString('hex'));
					const presentationHexa = new vscode.ColorPresentation(c.toString('hexa'));
					const presentationHsl = new vscode.ColorPresentation(c.toString('hsl'));
					const presentationHsla = new vscode.ColorPresentation(c.toString('hsla'));
					const presentationRgb = new vscode.ColorPresentation(c.toString('rgb'));
					const presentationRgba = new vscode.ColorPresentation(c.toString('rgba'));

					let withAlpha = [
						presentationHexa,
						presentationHsla,
						presentationRgba
					];

					let withoutAlpha = [
						presentationHex,
						presentationHsl,
						presentationRgb
					];

					const parsed = parse(colString);

					if (colString.startsWith("#") && parsed.alpha !== 1) {
						withAlpha = [
							presentationHexa,
							presentationHsla,
							presentationRgba
						];
						// type = "hexa";

					}
					else if (colString.startsWith("#")) {
						withoutAlpha = [
							presentationHex,
							presentationHsl,
							presentationRgb,
						];
						// type = "hex";

					}
					else if ((parsed.type === "rgb" && parsed.alpha !== 1) || parsed.type === "rgba") {
						withAlpha = [
							presentationRgba,
							presentationHexa,
							presentationHsla,
						];
						// type = "rgba";

					}
					else if (parsed.type === "rgb" || parsed.type === "rgba") {
						withoutAlpha = [
							presentationRgb,
							presentationHex,
							presentationHsl,
						];
						// type = "rgb";

					}
					else if ((parsed.type === "hsl" && parsed.alpha !== 1) || parsed.type === "hsla") {
						withAlpha = [
							presentationHsla,
							presentationRgba,
							presentationHexa,
						];
						// type = "hsla";

					}
					else if (parsed.type === "hsl" || parsed.type === "hsla") {
						withoutAlpha = [
							presentationHsl,
							presentationRgb,
							presentationHex,
						];
						// type = "hsl";
					}


					return c.alpha !== 1 ? withAlpha : withoutAlpha;
				}
			});
		});
	}

	dispose() { }
}



export function activate(context: vscode.ExtensionContext) {
	const picker = new Picker();
	context.subscriptions.push(picker);
}

// this method is called when your extension is deactivated
export function deactivate() { }
