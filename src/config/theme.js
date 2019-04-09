import { createMuiTheme } from "@material-ui/core/styles";

const primaryHex = "#707CED";
const secondaryHex = "#FF20B1";
const textColorPrimary = "#656D78";
const textColorSecondary = "#4EB0E5";
const warningHex = "#ff6333";
const borderRadius = 3;
const dialogBackgroundColor = "rgba(112, 124, 237, 0.7)";
const callToActionBackground = "linear-gradient(to left, #e53d96, #5491cc)";

const shadows = ["none"];
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

const toolBarHeight = {
	minHeight: 56,
	"@media (min-width:0px) and (orientation: landscape)": {
		minHeight: 48
	},
	"@media (min-width:600px)": { minHeight: 70 }
};

const fontFamily = "TTCommons-Regular";
const fontFamilyBold = "TTCommons-Bold";
const fontFamilyDemiBold = "TTCommons-DemiBold";

const theme = createMuiTheme({
	typography: {
		fontFamily,
		fontSize: 16
	},
	shape: {
		borderRadius
	},
	shadows,
	palette: {
		background: {
			default: "rgba(245, 247, 250)"
		},
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
		},
		divider: "#d1d1d1"
	},
	overrides: {
		MuiDialog: {
			root: {
				backgroundColor: dialogBackgroundColor
			}
		},
		MuiAppBar: {
			root: {
				background: `linear-gradient(45deg, #FFF 30%, #FFF 90%)`,
				color: textColorPrimary,
				boxShadow: shadows[0],
				borderStyle: "solid",
				borderWidth: 0.6,
				borderColor: "rgba(157,163,180,0.25)",
				padding: 0
			}
		},
		MuiToolbar: {
			root: {}
		},
		MuiInput: {
			root: {
				fontFamily,
				fontSize: 17
			}
		},
		MuiInputLabel: {
			root: {
				fontFamily,
				color: textColorPrimary,
				textTransform: "capitalize"
			}
		},
		MuiFormHelperText: {
			root: {
				paddingBottom: 20
			}
		},
		MuiButton: {
			root: {
				boxShadow: shadows[1],
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
		},

		//For date picker
		MuiPickersToolbar: {
			toolbar: {
				backgroundColor: primaryHex
			}
		},
		MuiPickersCalendarHeader: {
			switchHeader: {
				// backgroundColor: lightBlue.A200,
				// color: 'white',
			}
		},
		MuiPickersDay: {
			day: {
				color: primaryHex
			},
			isSelected: {
				backgroundColor: secondaryHex
			},
			current: {
				color: secondaryHex
			}
		},
		MuiPickersModal: {
			dialogAction: {
				color: secondaryHex
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
	toolBarHeight,
	theme,
	callToActionBackground,
	fontFamily,
	fontFamilyBold,
	fontFamilyDemiBold
};
