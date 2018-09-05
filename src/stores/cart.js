import { observable, computed, action } from "mobx";
import { observer } from "mobx-react";
import notifications from "./notifications";
import api from "../helpers/api";

class Cart {
	@observable
	cartId = null;

	@observable
	selectedTickets = {}; //{id: quantity}

	@action
	refreshCart() {
		api()
			.get("/cart")
			.then(response => {
				const { data } = response;

				const { cartId, tickets } = data;
				this.cartId = cartId;
				this.selectedTickets = tickets;
			})
			.catch(error => {
				console.error(error);

				let message = "Loading cart details failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	@action
	addToCart(selectedTickets) {
		this.selectedTickets = { ...this.selectedTickets, ...selectedTickets };
	}

	@action
	emptyCart(selectedTickets) {
		this.selectedTickets = {};
	}

	@computed
	get ticketCount() {
		return this.selectedTickets ? Object.keys(this.selectedTickets).length : 0;
	}
}

const cart = new Cart();

export default cart;
