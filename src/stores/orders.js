import { observable, computed, action } from "mobx";
import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";
import user from "./user";

class Orders {
	@observable
	items = null;

	@action
	refreshOrders() {
		//Right now carts only work for authed users
		if (!user.isAuthenticated) {
			this.emptyOrders();
			return;
		}

		Bigneon()
			.orders.index()
			.then(response => {
				const { data, paging } = response.data; //TODO pagination
				this.items = data;
			})
			.catch(error => {
				console.error(error);
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading orders failed."
				});
			});
	}

	emptyOrders() {
		this.items = [];
	}

	@computed
	get orderCount() {
		if (!this.items) {
			return 0;
		}

		return this.items.length;
	}
}

const orders = new Orders();

export default orders;
