import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { fontFamilyDemiBold, secondaryHex } from "../styles/theme";
import changeUrlParam from "../../helpers/changeUrlParam";
import getUrlParam from "../../helpers/getUrlParam";

//Pass through PagingInterface returned from bn-api-node
//https://big-neon.github.io/bn-api-node/interfaces/_interfaces_resources_structures_paging_interface_.paginginterface.html

const styles = theme => {
	return {
		root: {
			width: "100%",
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			marginTop: theme.spacing.unit * 2,
			marginBottom: theme.spacing.unit * 2
		},
		endPointActionContainer: {
			cursor: "pointer",
			display: "flex",
			alignItems: "center"
		},
		endPointActionText: {
			textTransform: "uppercase",
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 0.85,
			marginLeft: theme.spacing.unit * 0.6,
			marginRight: theme.spacing.unit * 0.6
		},
		endPointActionTextDisabled: {
			color: "#DEE2E8"
		},
		endPointActionIcon: {
			width: 10,
			height: 10,
			marginBottom: 4
		},
		endPointActionIconDisabled: {
			display: "none"
		},
		pages: {
			display: "flex"
		},
		pageNumberContainer: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			width: 30,
			height: 30,
			marginRight: theme.spacing.unit / 2,
			marginLeft: theme.spacing.unit / 2,
			borderRadius: 6,
			borderStyle: "solid",
			borderWidth: 0.8,
			borderColor: "#DEE2E8"
		},
		activePageNumberContainer: {
			backgroundColor: secondaryHex
		},
		pageNumber: {
			lineHeight: 0,
			marginTop: 2,
			fontSize: theme.typography.fontSize * 0.85
		},
		activePageNumber: {
			color: "#FFFFFF"
		}
	};
};

const NumberBlock = ({ classes, active, onClick, children }) => (
	<div
		onClick={onClick}
		className={classnames({ [classes.pageNumberContainer]: true, [classes.activePageNumberContainer]: active })}
		style={{ cursor: onClick ? "pointer" : "default" }}
	>
		<Typography className={classnames({ [classes.pageNumber]: true, [classes.activePageNumber]: active })}>
			{children}
		</Typography>
	</div>
);

const PaginationBlock = props => {
	const {
		classes,
		paging,
		onChange,
		isLoading
	} = props;

	if (!paging) {
		return null;
	}

	//Prevent making page changes while the page is still loading
	const onPageChange = isLoading ? () => {} :
		(page) => {
			onChange(page);
			changeUrlParam("page", page + 1);
		};

	const { page, limit, total } = paging;

	const totalPages = Math.ceil(total / limit);

	//Must be even int
	const maxPageBlocks = 10;
	const maxStartRange = maxPageBlocks / 2;
	const maxEndRange = totalPages - (maxPageBlocks / 2);

	let appendedMiddleSpace = false;

	const numberBlocks = [];
	for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
		if (pageIndex <= maxStartRange || pageIndex + 1 >= maxEndRange) {
			const active = page === pageIndex;
			numberBlocks.push(
				<NumberBlock onClick={!active ? () => onPageChange(pageIndex) : null} key={pageIndex} active={active && !isLoading} classes={classes}>
					{pageIndex + 1}
				</NumberBlock>
			);

		} else if (!appendedMiddleSpace) {
			appendedMiddleSpace = true;
			numberBlocks.push(
				<NumberBlock key={pageIndex} classes={classes}>
					-
				</NumberBlock>
			);
		}
	}

	let onPrevious;
	if (!page > 1 ) {
		onPrevious = () => onPageChange(page - 1);
	}

	let onNext;
	if (page < totalPages - 1) {
		onNext = () => onPageChange(page + 1);
	}

	return (
		<div className={classes.root}>
			<div className={classes.endPointActionContainer} onClick={onPrevious}>
				<img className={classnames({ [classes.endPointActionIcon]: true, [classes.endPointActionIconDisabled]: !onPrevious })} alt="Previous page" src="/icons/left-active.svg"/>
				<Typography className={classnames({ [classes.endPointActionText]: true, [classes.endPointActionTextDisabled]: !onPrevious })}>
					Previous
				</Typography>
			</div>

			<div className={classes.pages}>
				{numberBlocks}
			</div>

			<div className={classes.endPointActionContainer}  onClick={onNext}>
				<Typography className={classnames({ [classes.endPointActionText]: true, [classes.endPointActionTextDisabled]: !onNext })}>Next</Typography>
				<img className={classnames({ [classes.endPointActionIcon]: true, [classes.endPointActionIconDisabled]: !onNext })} alt="Next page" src="/icons/right-active.svg"/>
			</div>
		</div>
	);
};

PaginationBlock.propTypes = {
	classes: PropTypes.object.isRequired,
	paging: PropTypes.shape({
		page: PropTypes.number.isRequired,
		limit: PropTypes.number.isRequired,
		total: PropTypes.number.isRequired
	}),
	onChange: PropTypes.func.isRequired,
	isLoading: PropTypes.bool //To prevent too many api calls
};

export const urlPageParam = () => {
	const pageString = getUrlParam("page");

	let page = 0;

	if (pageString) {
		page = Number(pageString) - 1;
	}

	return page;
};

export const Pagination = withStyles(styles)(PaginationBlock);

