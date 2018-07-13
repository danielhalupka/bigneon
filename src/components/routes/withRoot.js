import React from "react";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

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
		// Name of the component ⚛️ / style sheet
		MuiButton: {
			// Name of the rule
			root: {
				background: `linear-gradient(45deg, ${textColorSecondary} 10%, ${primaryHex} 30%, ${secondaryHex} 90%)`,
				borderRadius: 3,
				border: 0,
				color: "white",
				padding: "0 30px",
				boxShadow: "0 2px 2px 0px rgba(1, 1, 1, .2)"
			}
		},
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

const withRoot = Component => {
	const WithRoot = props => {
		// MuiThemeProvider makes the theme available down the React tree
		// thanks to React context.
		return (
			<MuiThemeProvider theme={theme}>
				{/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
				<CssBaseline />
				<Component {...props} />
			</MuiThemeProvider>
		);
	};

	return WithRoot;
};

export default withRoot;
