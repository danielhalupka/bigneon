import { observable, computed, action } from "mobx";
import axios from "axios";
import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";

class Cart {
	@observable
	id = null; //Cart ID

	@observable
	items = [];

	@observable
	total_in_cents = 0;

	@action
	refreshCart() {
		Bigneon()
			.cart.index()
			.then(response => {
				const { data } = response;
				const { id, items, total_in_cents } = data;
				console.log(data);

				this.id = id;
				this.items = items;
				this.total_in_cents = total_in_cents;
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
		//TODO delete from cart using API first
		this.selectedTickets = {};
	}

	@computed
	get ticketCount() {
		if (!this.items) {
			return 0;
		}

		let count = 0;
		this.items.forEach(({ item_type, quantity }) => {
			if (item_type === "Tickets") {
				count = count + quantity;
			}
		});

		return count;
	}

	@computed
	get fees() {
		if (!this.items) {
			return 0;
		}

		let fees = 0;
		this.items.forEach(item => {
			const { item_type, quantity, unit_price_in_cents } = item;
			if (item_type === "Fees") {
				console.log(unit_price_in_cents);
				console.log(quantity);
				fees = fees + unit_price_in_cents * quantity;
			}
		});

		return fees;
	}
}

const cart = new Cart();

export default cart;
