import { observable, computed, action } from "mobx";
import axios from "axios";
import notifications from "./notifications";
import Bigneon from "../helpers/bigneon";
import user from "./user";

class Cart {
	@observable
	id = null; //Cart ID

	@observable
	items = [];

	@observable
	total_in_cents = 0;

	@observable
	seconds_until_expiry = null;

	cartExpiryTicker = null;

	startExpiryTicker() {
		if (this.cartExpiryTicker) {
			clearInterval(this.cartExpiryTicker);
		}

		this.cartExpiryTicker = setInterval(() => {
			if (!this.seconds_until_expiry || this.seconds_until_expiry < 1) {
				clearInterval(this.cartExpiryTicker);
				this.refreshCart();
			} else {
				this.seconds_until_expiry--;

				//Refresh the cart from server every 30 seconds as JS can be paused in browsers
				if (this.seconds_until_expiry % 30 === 0) {
					this.refreshCart();
				}
			}
		}, 1000);
	}

	@action
	refreshCart() {
		//Right now carts only work for authed users
		if (!user.isAuthenticated) {
			this.emptyCart();
			return;
		}

		Bigneon()
			.cart.read()
			.then(response => {
				const { data } = response;
				if (data) {
					const { id, items, total_in_cents, seconds_until_expiry } = data;

					this.id = id;
					this.items = items;
					this.total_in_cents = total_in_cents;

					if (seconds_until_expiry) {
						this.seconds_until_expiry = seconds_until_expiry;
						this.startExpiryTicker();
					} else {
						this.seconds_until_expiry = null;
					}
				}
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
		let items = [];
		ticketIds.forEach(id => {
			const quantity = selectedTickets[id];
			items.push({
				ticket_type_id: id,
				quantity
			});
		});

		Bigneon()
			.cart.add({ items })
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
	removeFromCart(cart_item_id, quantity, onSuccess, onError) {
		Bigneon()
			.cart.del({ cart_item_id, quantity })
			.then(() => {
				//TODO maybe update the store variable quickly, then refresh from cart for that zippy feeling
				this.refreshCart();
				onSuccess();
			})
			.catch(error => onError(error));
	}

	@action
	emptyCart() {
		//TODO delete from cart using API first
		this.items = [];
		this.id = null;
		this.total_in_cents = 0;
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
				fees = fees + unit_price_in_cents * quantity;
			}
		});

		return fees / 100;
	}

	@computed
	get formattedExpiryTime() {
		if (!this.seconds_until_expiry) {
			return null;
		}
		const minutes = Math.floor(this.seconds_until_expiry / 60);
		const seconds = this.seconds_until_expiry - minutes * 60;

		return `${minutes > 0 ? `${minutes}:` : ""}${
			seconds >= 10 ? seconds : `0${seconds}`
		}`;
	}
}

const cart = new Cart();

export default cart;
