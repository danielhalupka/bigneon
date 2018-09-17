import { observable, computed, action } from "mobx";
import axios from "axios";
import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";

class Cart {
	@observable
	cartId = null;

	@observable
	selectedTickets = {}; //{id: quantity}

	@action
	refreshCart() {
		Bigneon()
			.cart.index()
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
	addToCart(selectedTickets, onSuccess, onError) {
		const ticketIds = Object.keys(selectedTickets);

		//Promises array of posts to the add cart function and iterate through them
		let cartAddPromises = [];
		ticketIds.forEach(id => {
			const quantity = selectedTickets[id];
			const ticketRequestParams = {
				ticket_type_id: id,
				quantity
			};

			cartAddPromises.push(Bigneon().cart.add(ticketRequestParams));
		});

		axios
			.all(cartAddPromises)
			.then(results => {
				//Quick add to update store
				this.selectedTickets = { ...this.selectedTickets, ...selectedTickets };

				//Refresh cart from the API to make sure we in sync
				this.refreshCart();

				onSuccess();
			})
			.catch(error => {
				console.error(error);
				onError(error);
			});
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
