import { createMuiTheme } from "@material-ui/core/styles";

const primaryHex = "#707CED";
const secondaryHex = "#FF20B1";
const textColorPrimary = "#1E1E1E";
const textColorSecondary = "#4EB0E5";

const theme = createMuiTheme({
	typography: {
		fontFamily: "BebasNeue-Regular",
		fontSize: 16
	},
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
				//	height: 48,
				boxShadow: "0 2px 2px 0px rgba(1, 1, 1, .2)"
			}
		}
	}
});

export {
	primaryHex,
	secondaryHex,
	textColorPrimary,
	textColorSecondary,
	theme
};
