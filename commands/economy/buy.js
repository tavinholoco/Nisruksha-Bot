module.exports = {
    name: 'comprar',
    aliases: ['buy', 'c'],
    category: 'Economia',
    description: 'Faz a compra de um item da loja',
	async execute(API, msg) {

		const boolean = await API.checkAll(msg);
        if (boolean) return;

        const args = API.args(msg);
        let obj = API.shopExtension.getShopObj();
        let array = Object.keys(obj);
        if (args.length == 0) {
            API.sendError(msg, `Você precisa especificar um id de item para compra!\nVisualize uma lista de produtos disponíveis`, `loja <${array.join(' | ').toUpperCase()}>`)
			return;
        }

        if (!API.isInt(args[0])) {
            API.sendError(msg, `Você precisa especificar um id de item (número)!\nVisualize uma lista de produtos disponíveis`, `loja <${array.join(' | ').toUpperCase()}>`)
            return;
        }

        let id = parseInt(args[0]);

        if (!API.shopExtension.checkIdExists(id)) {
            API.sendError(msg, `Você precisa especificar um id de item existente para compra!\nVisualize uma lista de produtos disponíveis`, `loja <${array.join(' | ').toUpperCase()}>`)
            return;
        }
        
		API.shopExtension.execute(msg, API.shopExtension.getProduct(id));

	}
};