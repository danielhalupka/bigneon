import { createMuiTheme } from "@material-ui/core/styles";

const primaryHex = "#707CED";
const secondaryHex = "#FF20B1";
const textColorPrimary = "#1E1E1E";
const textColorSecondary = "#4EB0E5";
const warningHex = "#ff6333";

const borderRadius = 3;

let shadows = ["none"];
let baseShadow = 0.4;
const increaseBy = 0.01;
for (let index = 0; index < 24; index++) {
	baseShadow = (Number(baseShadow) + increaseBy).toFixed(2);
	const baseShadow2 = `${(baseShadow * 2).toFixed(2)}`;
	const baseShadow3 = `${(baseShadow * 3).toFixed(2)}`;

	shadows.push(
		`0px ${baseShadow}px ${baseShadow3}px 0px rgba(0, 0, 0, 0.1),0px ${baseShadow}px ${baseShadow}px 0px rgba(0, 0, 0, 0.1),0px ${baseShadow2}px ${baseShadow}px -${baseShadow}px rgba(0, 0, 0, 0.1)`
	);
}

const theme = createMuiTheme({
	typography: {
		fontFamily: "TTCommons-Regular",
		fontSize: 16
	},
	shape: {
		borderRadius
	},
	shadows,
	palette: {
		primary: {
			light: primaryHex,
			main: primaryHex,
			dark: primaryHex,
			contrastText: "#FFF"
		},
		secondary: {
			light: secondaryHex,
			main: secondaryHex,
			dark: secondaryHex,
			contrastText: "#FFF"
		}
	},
	overrides: {
		MuiAppBar: {
			root: {
				background: `linear-gradient(45deg, #FFF 30%, #FFF 90%)`,
				color: textColorPrimary,
				boxShadow: shadows[1]
			}
		},
		MuiInput: {
			root: {
				fontFamily: "TTCommons-Regular",
				fontSize: 17
			}
		},
		MuiFormHelperText: {
			root: {
				paddingBottom: 20
			}
		},
		MuiButton: {
			root: {
				boxShadow: shadows[2],
				borderRadius
			}
		},
		MuiExpansionPanelSummary: {
			root: {
				padding: 0,
				borderRadius
			},
			content: {
				margin: 0
			},
			expanded: {
				padding: 0,
				margin: 0
			}
		}
	}
});

export {
	primaryHex,
	secondaryHex,
	textColorPrimary,
	textColorSecondary,
	warningHex,
	theme
};
