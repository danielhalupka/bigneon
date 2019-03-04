import React from "react";
import { observer } from "mobx-react";

import SelectOptionDialog from "../../SelectOptionDialog";
import MenuItem from "../../../elements/menu/MenuItem";
import user from "../../../../stores/user";
import { Avatar, Hidden } from "@material-ui/core";

@observer
class MobileSwitchOrgMenuItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false
		};
	}

	render() {
		const { open } = this.state;

		const { currentOrganizationId, organizations } = user;

		//If there are no orgs or the user only belong to one, don't give them options
		if (!organizations || Object.keys(organizations).length < 2) {
			return null;
		}

		return (
			<Hidden mdUp>
				<MenuItem
					onClick={() => this.setState({ open: true })}
					shortLayout
					iconName="account"
				>
					Switch org
				</MenuItem>
				<SelectOptionDialog
					iconUrl={"/icons/user-white.svg"}
					heading={"Switch organization"}
					onClose={() => this.setState({ open: false })}
					open={open}
					items={organizations}
					onSelect={(id) => {
						user.setCurrentOrganizationRolesAndScopes(id, true);
					}}
					selectedKey={currentOrganizationId}
				/>
			</Hidden>
		);
	}
}

export default MobileSwitchOrgMenuItem;
