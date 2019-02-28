import Bigneon from "../../../../helpers/bigneon";
import cart from "../../../../stores/cart";

export const onAddItemsToCart = async (items) => {
	return new Promise(function(resolve, reject) {
		Bigneon()
			.cart.replace({ items, box_office_pricing: true })
			.then(response => {
				const { data } = response;
				resolve({ result: data });
			})
			.catch(error => {
				resolve({ error });
			});
	});
};

export const onCheckout = async ({ firstName, lastName, phone, email, note }) => {
	return new Promise(function(resolve, reject) {
		Bigneon()
			.cart.checkout({
				amount: cart.total_in_cents,
				method: {
					type: "External",
					reference: "BoxOfficeSale",
					first_name: firstName,
					last_name: lastName,
					phone,
					email,
					note
				}
			})
			.then(response => {
				const { data } = response;
				resolve({ result: data });
			})
			.catch(error => {
				resolve({ error });
			});
	});
};