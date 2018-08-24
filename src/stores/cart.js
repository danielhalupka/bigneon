import { observable, computed, action } from "mobx";
import { observer } from "mobx-react";
import notifications from "./notifications";
import api from "../helpers/api";

class Cart {
	@observable
	cartId = null;

	@observable
	tickets = [];

	@action
	refreshCart() {
		api()
			.get("/cart")
			.then(response => {
				const { data } = response;

				const { cartId, tickets } = data;
				this.cartId = cartId;
				this.tickets = tickets;
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
	addToCart(tickets) {
		this.tickets = tickets.concat(this.tickets);
	}

	@action
	emptyCart(tickets) {
		this.tickets = [];
	}

	@computed
	get ticketCount() {
		return this.tickets ? this.tickets.length : 0;
	}
}

const cart = new Cart();

export default cart;
