// Field names for all export type.
// Every type has basic and specific fields.
// If the field contains ___ it's the function.
export const fieldNames = {
	products: {
		basic: {
			id: 'ID',
			handle: 'Handle',
			command: 'Command',
			title: 'Title',
			body_html: 'Description',
			vendor: 'Vendor',
			product_type: 'Product Type',
			tags: 'Tags',
			tags_command: 'Tags Command',

			time_conv__created_at___created_at: 'Created At',
			time_conv__updated_at___updated_at: 'Updated At',
			status___status: 'Status',
			published___published_at: 'Published',
			time_conv__published_at___published_at: 'Published At',
			published_scope: 'Published Scope',
			template_suffix: 'Template Suffix',
			domain___handle: 'URL',

			row_number_command: 'Row #',
			top_row_command: 'Top Row',
		},
		variants: {
			is_main: true,
			id: 'Variant ID',
			variant_command: 'Variant Command',
			price: 'Variant Price',
			compare_at_price: 'Variant Compare At Price',
			sku: 'Variant SKU',
			barcode: 'Variant Barcode',
			option1: 'Option1 Value',
			option2: 'Option2 Value',
			option3: 'Option3 Value',
			inventory_quantity: 'Variant Inventory Qty',
		},
		images: {
			is_main: true,
			src: 'Image Src',
			image_command: 'Image Command',
			position: 'Image Position',
			width: 'Image Width',
			height: 'Image Height',
			alt: 'Image Alt Text',
		},
		metafields: {
			h_product___metafields: 'Metafield',
			h_variant___variant_metafields: 'Variant Metafield',
		},
	},
	customers: {
		basic: {
			id: 'ID',
			email: 'Email',
			command: 'Command',
			first_name: 'First Name',
			last_name: 'Last Name',
			phone: 'Phone',
			state: 'State',
			email_marketing__state___email_marketing_consent: 'Email Marketing: Status',
			email_marketing__opt_in_level___email_marketing_consent: 'Email Marketing: Level',
			email_marketing__consent_updated_at___email_marketing_consent:
				'Email Marketing: Updated At',
			sms_marketing__state___sms_marketing_consent: 'SMS Marketing: Status',
			sms_marketing__opt_in_level___sms_marketing_consent: 'SMS Marketing: Level',
			sms_marketing__consent_updated_at___sms_marketing_consent: 'SMS Marketing: Updated At',
			sms_marketing__consent_collected_from___sms_marketing_consent: 'SMS Marketing: Source',
			time_conv__created_at___created_at: 'Created At',
			time_conv__updated_at___updated_at: 'Updated At',
			note: 'Note',
			verified_email: 'Verified Email',
			tax_exempt: 'Tax Exempt',
			tags: 'Tags',
			tags_command: 'Tags Command',

			total_spent: 'Total Spent',
			orders_count: 'Total Orders',
			// TODO: where should get those fields?
			account_activation_email: 'Send Account Activation Email',
			welcom_email: 'Send Welcome Email',
			password: 'Password',
			multipass_identifier: 'Multipass Identifier',

			row_number_command: 'Row #',
			top_row_command: 'Top Row',
		},
		addresses: {
			is_main: true,
			id: 'Address ID',
			address_command: 'Address Command',
			first_name: 'Address First Name',
			last_name: 'Address Last Name',
			phone: 'Address Phone',
			company: 'Address Company',
			address1: 'Address Line 1',
			address2: 'Address Line 2',
			city: 'Address City',
			province: 'Address Province',
			province_code: 'Address Province Code',
			country: 'Address Country',
			country_code: 'Address Country Code',
			zip: 'Address Zip',
			default: 'Address Is Default',
		},
	},
	orders: {
		basic: {
			id: 'ID',
			name: 'Name',

			command: 'Command',
			send_receip_command: 'Send Receipt',
			inventory_behaviour_command: 'Inventory Behaviour',

			number: 'Number',
			phone: 'Phone',
			email: 'Email',
			note: 'Note',
			tags: 'Tags',

			tags_command: 'Tags Command',

			time_conv__created_at___created_at: 'Created At',
			time_conv__updated_at___updated_at: 'Updated At',
			time_conv__cancelled_at___cancelled_at: 'Cancelled At',
			cancel_reason: 'Cancel: Reason',

			cancel_send_receipt: 'Cancel: Send Receipt',
			cancel_refund: 'Cancel: Refund',

			time_conv__processed_at___processed_at: 'Processed At',
			time_conv__closed_at___closed_at: 'Closed At',
			currency: 'Currency',
			source_name: 'Source',

			location_id: 'Physical Location',

			user_id: 'User ID',
			checkout_id: 'Checkout ID',
			checkout_token: 'Cart Token',
			token: 'Token',
			order_status_url: 'Order Status URL',
			total_weight: 'Weight Total',
			total_line_items_price: 'Price: Total Line Items',
			subtotal_price: 'Price: Subtotal',
			n_tax__title___tax_lines: 'Tax {n}: Title', // # Tax 1, 2, 3 etc.. for each tax_lines
			n_tax__rate___tax_lines: 'Tax {n}: Rate',
			n_tax__price___tax_lines: 'Tax {n}: Price',

			// 'tax_lines.title': 'Tax 1: Title', // # Tax 1, 2, 3 etc.. for each tax_lines
			// 'tax_lines.rate': 'Tax 1: Rate',
			// 'tax_lines.price': 'Tax 1: Price',

			taxes_included: 'Tax: Included',
			total_tax: 'Tax: Total',
			total_discounts: 'Price: Total Discount',
			ship___total_shipping_price_set: 'Price: Total Shipping',
			total_refund___refunds: 'Price: Total Refund',
			total_outstanding: 'Price: Total Outstanding',
			current_total_price: 'Price: Current Total',
			total_price: 'Price: Total',
			financial_status: 'Payment: Status',
			processing_method: 'Payment: Processing Method',
			fulfillment_status: 'Order Fulfillment Status',
			additional_details___note_attributes: 'Additional Details', // Additional Details is built from order.note_attributes.
		},
		customer: {
			is_main: false,
			id: 'Customer: ID',
			email: 'Customer: Email',
			phone: 'Customer: Phone',
			first_name: 'Customer: First Name',
			last_name: 'Customer: Last Name',
			note: 'Customer: Note',
			state: 'Customer: State',
			tags: 'Customer: Tags',
			accepts_marketing: 'Customer: Accepts Marketing',
			orders_count: 'Customer: Orders Count',
			total_spent: 'Customer: Total Spent',
		},
		billing_address: {
			is_main: false,
			first_name: 'Billing: First Name',
			last_name: 'Billing: Last Name',
			company: 'Billing: Company',
			phone: 'Billing: Phone',
			address1: 'Billing: Address1',
			address2: 'Billing: Address2',
			zip: 'Billing: Zip',
			city: 'Billing: City',
			province: 'Billing: Province',
			province_code: 'Billing: Province Code',
			country: 'Billing: Country',
			country_code: 'Billing: Country Code',
		},
		shipping_address: {
			is_main: false,
			first_name: 'Shipping: First Name',
			last_name: 'Shipping: Last Name',
			company: 'Shipping: Company',
			phone: 'Shipping: Phone',
			address1: 'Shipping: Address1',
			address2: 'Shipping: Address2',
			zip: 'Shipping: Zip',
			city: 'Shipping: City',
			province: 'Shipping: Province',
			province_code: 'Shipping: Province Code',
			country: 'Shipping: Country',
			country_code: 'Shipping: Country Code',
		},
		client_details: {
			is_main: false,
			browser_ip: 'Browser: IP',
			browser_width: 'Browser: Width',
			browser_height: 'Browser: Height',
			user_agent: 'Browser: User Agent',
			landing_page___landing_site: 'Browser: Landing Page',
			referrer___referring_site: 'Browser: Referrer',
			referrer_domain___referring_site: 'Browser: Referrer Domain',
			search_keywords: 'Browser: Search Keywords',
			ad_url: 'Browser: Ad URL',
			utm_source: 'Browser: UTM Source',
			utm_medium: 'Browser: UTM Medium',
			utm_campaign: 'Browser: UTM Campaign',
			utm_term: 'Browser: UTM Term',
			utm_content: 'Browser: UTM Content',

			row_number_command: 'Row #',
			top_row_command: 'Top Row',
			line_type_command: 'Line: Type',
		},
		line_items: {
			is_multi: true,
			id: 'Line: ID',
			line_command: 'Line: Command',
			product_id: 'Line: Product ID',
			product_handle: 'Line: Product Handle', // product handle
			title: 'Line: Title',
			name: 'Line: Name',
			variant_id: 'Line: Variant ID',
			variant_title: 'Line: Variant Title',
			sku: 'Line: SKU',
			quantity: 'Line: Quantity',
			price: 'Line: Price',
			total_discount: 'Line: Discount',

			discount_allocation: 'Line: Discount Allocation', // discount allocation, discount per item
			discount_per_item: 'Line: Discount per Item',

			line_total___quantity__price__total__discount: 'Line: Total', // *
			grams: 'Line: Grams',
			requires_shipping: 'Line: Requires Shipping',
			vendor: 'Line: Vendor',
			properties: 'Line: Properties', // # Same format as note_attributes
			gift_card: 'Line: Gift Card',

			force_gift_card: 'Line: Force Gift Card', // force gift card

			taxable: 'Line: Taxable',
			line_tax_sum___tax_lines: 'Line: Tax Total',
			n_line_tax__title___tax_lines: 'Line: Tax {n} Title', // # Tax 1, 2, 3 etc.. for each tax_lines
			n_line_tax__rate___tax_lines: 'Line: Tax {n} Rate',
			n_line_tax__price___tax_lines: 'Line: Tax {n} Price',

			// 'tax_lines.title': 'Line: Tax 1 Title', // # Tax 1, 2, 3 etc.. for each tax_lines
			// 'tax_lines.rate': 'Line: Tax 1 Rate',
			// 'tax_lines.price': 'Line: Tax 1 Price',
			fulfillable_quantity: 'Line: Fulfillable Quantity',
			fulfillment_service: 'Line: Fulfillment Service',
			fulfillment_status: 'Line: Fulfillment Status',
			pre_tax_price: 'Line: Pre Tax Price',
			origin_location__name___origin_location: 'Shipping Origin: Name',
			origin_location__country_code___origin_location: 'Shipping Origin: Country Code',
			origin_location__province_code___origin_location: 'Shipping Origin: Province Code',
			origin_location__city___origin_location: 'Shipping Origin: City',
			origin_location__address1___origin_location: 'Shipping Origin: Address 1',
			origin_location__address2___origin_location: 'Shipping Origin: Address 2',
			origin_location__zip___origin_location: 'Shipping Origin: Zip',
		},
		refunds: {
			is_multi: true,
			id: 'Refund: ID',
			refunds_time_conv__created_at___created_at: 'Refund: Created At',
			note: 'Refund: Note',
			// TODO: restock fields goes here
			restock: 'Refund: Restock',
			restock_type: 'Refund: Restock Type',
			restock_location: 'Refund: Restock Location',
			send_receip: 'Refund: Send Receipt',
			generate_transaction: 'Refund: Generate Transaction',
		},
		transactions: {
			is_multi: true,
			id: 'Transaction: ID',
			kind: 'Transaction: Kind',
			processed_at: 'Transaction: Processed At',
			amount: 'Transaction: Amount',
			currency: 'Transaction: Currency',
			status: 'Transaction: Status',
			message: 'Transaction: Message',
			gateway: 'Transaction: Gateway',
			force_gateway: 'Transaction: Force Gateway',
			test: 'Transaction: Test',
			authorization: 'Transaction: Authorization',
			parent_id: 'Transaction: Parent ID',
			error_code: 'Transaction: Error Code',
			cc__avs_result_code___payment_details: 'Transaction: CC AVS Result',
			cc__credit_card_bin___payment_details: 'Transaction: CC Bin',
			cc__cvv_result_code___payment_details: 'Transaction: CC CVV Result',
			cc__credit_card_number___payment_details: 'Transaction: CC Number',
			cc__credit_card_company___payment_details: 'Transaction: CC Company',
		},
		risks: {
			is_multi: true,
			source: 'Risk: Source',
			score: 'Risk: Score',
			recommendation: 'Risk: Recommendation',
			cause_cancel: 'Risk: Cause Cancel',
			message: 'Risk: Message',
		},
		fulfillments: {
			is_multi: true,
			id: 'Fulfillment: ID',

			status: 'Fulfillment: Status',
			fulfillments_time_conv__created_at___created_at: 'Fulfillment: Created At',
			fulfillments_time_conv__updated_at___updated_at: 'Fulfillment: Updated At',
			tracking_company: 'Fulfillment: Tracking Company',
			location: 'Fulfillment: Location', // location, shipment status
			shipment_status: 'Fulfillment: Shipment Status',
			tracking_number: 'Fulfillment: Tracking Number',
			tracking_url: 'Fulfillment: Tracking URL', // tracking url, send receipt
			send_receipt: 'Fulfillment: Send Receipt',
		},
	},
	custom_collections: {
		basic: {
			id: 'ID',
			handle: 'Handle',
			command: 'Command',
			title: 'Title',
			body_html: 'Body HTML',
			sort_order: 'Sort Order',
			template_suffix: 'Template Suffix',
			time_conv__updated_at___updated_at: 'Updated At',
			published___published_at: 'Published',
			time_conv__published_at___published_at: 'Published At',
			published_scope: 'Published Scope',
			image__src___image: 'Image Src',
			image__width___image: 'Image Width',
			image__height___image: 'Image Height',
			image__alt___image: 'Image Alt Text',
			row_number_command: 'Row #',
			top_row_command: 'Top Row',
		},
		products: {
			is_main: true,
			id: 'Product: ID',
			handle: 'Product: Handle',
			position___id: 'Product: Position',
			product_command: 'Product: Command',
		},
	},
	smart_collections: {
		basic: {
			id: 'ID',
			handle: 'Handle',
			command: 'Command',
			title: 'Title',
			body_html: 'Body HTML',
			sort_order: 'Sort Order',
			template_suffix: 'Template Suffix',
			time_conv__updated_at___updated_at: 'Updated At',
			published___published_at: 'Published',
			time_conv__published_at___published_at: 'Published At',
			published_scope: 'Published Scope',
			image__src___image: 'Image Src',
			image__width___image: 'Image Width',
			image__height___image: 'Image Height',
			image__alt___image: 'Image Alt Text',
			row_number_command: 'Row #',
			top_row_command: 'Top Row',
		},
		rules: {
			is_main: true,
			must_match___id: 'Must Match',
			column: 'Rule: Product Column',
			relation: 'Rule: Relation',
			condition: 'Rule: Condition',
		},
	},
	metaobject_entries: {
		basic: {
			id: 'ID',
			handle: 'Handle',
			command: 'Command',

			displayName: 'Display Name',
			status: 'Status',
			updatedAt: 'Updated At',
			definitionHandle: 'Definition: Handle',
			definitionName: 'Definition: Name',
			top_row_command: 'Top Row',
			row_number_command: 'Row #',
		},
		field: {
			fieldKey: 'Field',
			fieldValue: 'Value',
		},
	},
	price_rules: {
		basic: {
			id: 'ID',
			title: 'Title',
			command: 'Command',
			value_type: 'Discount Type',
			value: 'Discount Value',
			minimum_purchase___prerequisite_subtotal_range: 'Minimum Purchase Amount',
			usage_limit: 'Limit Total Times',
			once_per_customer: 'Limit Once Per Customer',

			limit_once___allocation_method: 'Limit Once Per Order',

			allocation_limit: 'Max Uses Per Order',
			prerequisite_quantity_range: 'Minimum Quantity Of Items',
			status___starts_at: 'Status',

			starts_at: 'Starts At',
			ends_at: 'Ends At',
			updated_at: 'Updated At',

			stringify___entitled_country_ids: 'Free Shipping: Country Codes',

			over_amount___prerequisite_to_entitlement_purchase: 'Free Shipping: Over Amount',

			minimum_quantity___prerequisite_to_entitlement_quantity_ratio:
				'Customer Buys: Quantity',
			prerequisite_collection_ids__itemVal: 'Customer Buys: Collections',
			prerequisite_product_ids__itemVal: 'Customer Buys: Products',
			prerequisite_variant_ids__itemVal: 'Customer Buys: Variants',
			customer_gets___prerequisite_to_entitlement_quantity_ratio: 'Customer Gets: Quantity',
			entitled_collection_ids__itemVal: 'Applies To: Collections',
			entitled_product_ids__itemVal: 'Applies To: Products',
			entitled_variant_ids__itemVal: 'Applies To: Variants',

			customer_segment_prerequisite_ids__itemVal: 'Applies To: Customer Groups',
			prerequisite_customer_ids__itemVal: 'Applies To: Customers',
			prerequisite_customer_ids__customerEmail: 'Applies To: Customers Email',

			// prerequisite_shipping_price_range: 'prerequisite_shipping_price_range',
			// prerequisite_saved_search_ids: 'prerequisite_saved_search_ids',
			// admin_graphql_api_id: 'admin_graphql_api_id',
			// customer_selection: 'customer_selection',
			// target_type: 'target_type',
			// target_selection: 'target_selection',
			// allocation_method: 'allocation_method',

			top_row_command: 'Top Row',
			row_number_command: 'Row #',
		},
		discount_codes: {
			is_main: true,
			code: 'Code',
			usage_count: 'Used Count',
			// created_at: 'created_at',
			// updated_at: 'updated_at',
			// id: 'id',
			// price_rule_id: 'price_rule_id',
		},
		entitled_collection_ids: {
			is_main: true,
		},
		entitled_product_ids: {
			is_main: true,
		},
		entitled_variant_ids: {
			is_main: true,
		},

		prerequisite_collection_ids: {
			is_main: true,
		},
		prerequisite_product_ids: {
			is_main: true,
		},
		prerequisite_variant_ids: {
			is_main: true,
		},
		prerequisite_customer_ids: {
			is_main: true,
		},
	},
	pages: {
		basic: {
			id: 'ID',
			handle: 'Handle',
			command: 'Command',
			title: 'Title',
			author: 'Author',
			body_html: 'Body HTML',
			created_at: 'Created At',
			updated_at: 'Updated At',
			published___published_at: 'Published',
			published_at: 'Published At',
			template_suffix: 'Template Suffix',

			row_number_command: 'Row #',
			top_row_command: 'Top Row',
		},
	},
	blogs: {
		articles: {
			is_main: true,
			
			id: 'ID',
			handle: 'Handle',
			command: "Command",

			title: 'Title',
			author: 'Author',
			body_html: 'Body HTML',
			summary_html: 'Summary HTML',
			tags: 'Tags',
			tags_command: 'Tags Command',

			created_at: 'Created At',
			updated_at: 'Updated At',
			published___published_at: 'Published',
			published_at: 'Published At',
			template_suffix: 'Template Suffix',
			image__src___image: 'Image Src',
			image__width___image: 'Image Width',
			image__height___image: 'Image Height',
			image__alt___image: 'Image Alt Text',
		},
		basic: {
			id: 'Blog: ID',
			handle: 'Blog: Handle',
			title: 'Blog: Title',
			commentable: 'Blog: Commentable',
			feedburner: 'Blog: Feedburner URL',
			feedburner_location: 'Blog: Feedburner Path',
			template_suffix: 'Blog: Template Suffix',

			created_at: 'Blog: Created At',
			updated_at: 'Blog: Updated At',
		},
	},
};

// Functions for all expor type.
export const convertion = {
	products: {
		basic: {
			published: obj => {
				return {
					...obj,
					published___published_at: !!obj.published_at,
				};
			},
			status: obj => {
				return {
					...obj,
					status___status: capitalize(obj.status),
				};
			},
			domain: obj => {
				return {
					...obj,
					domain___handle: `https://${obj.domain}/products/${obj.handle}`,
				};
			},
			time_conv: timeConv,
			h_product: obj => {
				let adds = {};
				for (const meta in obj.metafields) {
					adds = {
						...adds,
						[`h_product__${obj.metafields[meta]?.key}`]: obj.metafields[meta]?.value,
					};
				}

				return {
					...obj,
					...adds,
				};
			},
			h_variant: obj => obj,
		},
	},
	orders: {
		basic: {
			n_tax: (obj, field) => {
				let adds = {};
				for (const tax in obj.tax_lines) {
					adds = { ...adds, [`tax__${field}__${tax}`]: obj.tax_lines[tax][field] };
				}

				return {
					...obj,
					...adds,
				};
			},
			ship: obj => {
				return {
					...obj,
					ship___total_shipping_price_set:
						obj.total_shipping_price_set?.shop_money?.amount,
				};
			},
			total_refund: obj => {
				const total_refund = obj.refunds.reduce((sum, refund) => {
					return refund.transactions.reduce((s, t) => (s += +t.amount), sum);
				}, 0);

				return {
					...obj,
					total_refund___refunds: total_refund,
				};
			},
			additional_details: obj => {
				let adds = '';
				for (const add of obj.note_attributes) {
					adds += `${add.name}: ${add.value} \n`;
				}

				return {
					...obj,
					additional_details___note_attributes: adds,
				};
			},
			time_conv: timeConv,
		},
		client_details: {
			landing_page: obj => {
				return {
					...obj,
					landing_page___landing_site: obj.landing_site,
				};
			},
			referrer: obj => {
				return {
					...obj,
					referrer___referring_site: obj.referring_site,
				};
			},
			referrer_domain: obj => {
				return {
					...obj,
					referrer_domain___referring_site: obj.referring_site
						? new URL(obj.referring_site).hostname
						: null,
				};
			},
		},
		line_items: {
			n_line_tax: (obj, field) => {
				let adds = {};
				for (const tax in obj.line_items__tax_lines) {
					adds = {
						...adds,
						[`line_tax__${field}__${tax}`]: obj.line_items__tax_lines[tax][field],
					};
				}

				return {
					...obj,
					...adds,
				};
			},
			line_tax_sum: obj => {
				return {
					...obj,
					line_tax_sum___tax_lines: obj.line_items__tax_lines?.reduce(
						(sum, ele) => sum + +ele.price,
						0,
					),
				};
			},
			line_total: obj => {
				return {
					...obj,
					line_total___quantity__price__total__discount:
						+obj.line_items__price * obj.line_items__quantity +
						+obj.line_items__total_discount,
				};
			},
			origin_location: (obj, field) => {
				return {
					...obj,
					[`origin_location__${field}___origin_location`]:
						obj.line_items__origin_location?.[field],
				};
			},
		},
		transactions: {
			cc: (obj, field) => {
				return obj;
			},
		},
		refunds: {
			refunds_time_conv: (obj, field) => timeConv(obj, field, 'refunds__'),
		},
		fulfillments: {
			fulfillments_time_conv: (obj, field) => timeConv(obj, field, 'fulfillments__'),
		},
	},
	custom_collections: {
		basic: {
			published: obj => {
				return {
					...obj,
					published___published_at: !!obj.published_at,
				};
			},
			image: (obj, field) => {
				return {
					...obj,
					[`image__${field}___image`]: obj.image?.[field],
				};
			},
			time_conv: timeConv,
		},
		products: {
			position: obj => {
				return {
					...obj,
					position___id: obj.sort_order === 'manual' ? obj.products__item_index + 1 : '',
				};
			},
		},
	},
	smart_collections: {
		basic: {
			published: obj => {
				return {
					...obj,
					published___published_at: !!obj.published_at,
				};
			},
			image: (obj, field) => {
				return {
					...obj,
					[`image__${field}___image`]: obj.image?.[field],
				};
			},
			time_conv: timeConv,
		},
		rules: {
			must_match: obj => {
				return {
					...obj,
					must_match___id: obj.disjunctive ? 'any condition' : 'all conditions',
				};
			},
		},
	},
	customers: {
		basic: {
			email_marketing: (obj, field) => {
				return {
					...obj,
					[`email_marketing__${field}___email_marketing_consent`]:
						field === 'consent_updated_at'
							? getFormattedDate(obj.email_marketing_consent?.[field])
							: obj.email_marketing_consent?.[field],
				};
			},
			sms_marketing: (obj, field) => {
				return {
					...obj,
					[`sms_marketing__${field}___sms_marketing_consent`]:
						field === 'consent_updated_at'
							? getFormattedDate(obj.sms_marketing_consent?.[field])
							: obj.sms_marketing_consent?.[field],
				};
			},
			time_conv: timeConv,
		},
	},
	price_rules: {
		basic: {
			stringify(obj) {
				return {
					...obj,
					stringify___entitled_country_ids: obj.entitled_country_ids.toString(),
				};
			},
			minimum_purchase(obj) {
				return {
					...obj,
					minimum_purchase___prerequisite_subtotal_range:
						obj.prerequisite_subtotal_range?.greater_than_or_equal_to,
				};
			},
			over_amount(obj) {
				return {
					...obj,
					over_amount___prerequisite_to_entitlement_purchase:
						obj.prerequisite_to_entitlement_purchase?.prerequisite_amount,
				};
			},
			minimum_quantity(obj) {
				return {
					...obj,
					minimum_quantity___prerequisite_to_entitlement_quantity_ratio:
						obj.prerequisite_to_entitlement_quantity_ratio?.prerequisite_quantity,
				};
			},
			customer_gets(obj) {
				return {
					...obj,
					customer_gets___prerequisite_to_entitlement_quantity_ratio:
						obj.prerequisite_to_entitlement_quantity_ratio?.entitled_quantity,
				};
			},
			status(obj) {
				const now = new Date();
				const startDate = new Date(obj.starts_at);
				const endDate = new Date(obj.ends_at);
				const status =
					now - startDate > 0 && (!obj.ends_at || endDate > now)
						? 'Active'
						: now - startDate < 0
						? 'Scheduled'
						: 'Expired';

				return {
					...obj,
					status___starts_at: status,
				};
			},
			limit_once(obj) {
				return {
					...obj,
					limit_once___allocation_method:
						obj.value_type !== 'fixed_amount'
							? null
							: obj.allocation_method === 'across'
							? true
							: false,
				};
			},
		},
	},
	pages: {
		basic: {
			published(obj) {
				return {
					...obj,
					published___published_at: !!obj.published_at,
				};
			},
		},
	},
	blogs: {
		articles: {
			image: (obj, field) => {
				return {
					...obj,
					[`image__${field}___image`]: obj.articles__image?.[field],
				};
			},
			published: obj => {
				return {
					...obj,
					published___published_at: !!obj.articles__published_at,
				};
			},
		}
	}
};

export const isMain = (type, field) => {
	return fieldNames[type]?.[field]?.is_main || false;
};

export const isMulti = (type, field) => {
	return fieldNames[type]?.[field]?.is_multi || false;
};

// Format the specific fields like specific__key.
export const addPrefix = (object, prefix) => {
	const obj = { ...object };

	for (const key in obj) {
		obj[prefix + '__' + key] = obj[key];
		delete obj[key];
	}

	return obj;
};

// Make user selectable options from fieldNames object.
export const makeOptions = object => {
	return Object.keys(object)
		.filter(i => i !== 'is_main' && !i.includes('command') && i !== 'is_multi')
		.map(key => ({
			value: key,
			name: object[key],
		}));
};

export const productFields = [
	{
		value: 'basic',
		name: 'Basic Columns',
		open: true,
		children: makeOptions(fieldNames.products.basic),
	},
	{
		name: 'Inventory / Variants',
		value: 'variants',
		children: makeOptions(fieldNames.products.variants),
	},
	{
		name: 'Product Image',
		value: 'images',
		children: makeOptions(fieldNames.products.images),
	},
	{
		name: 'Product Metafield',
		value: 'h_product___metafields',
	},
	{
		name: 'Variant Metafield',
		value: 'h_variant___variant_metafields',
	},
];

export const orderFields = [
	{
		value: 'basic',
		name: 'Basic Columns',
		open: true,
		children: makeOptions(fieldNames.orders.basic),
	},
	{
		name: 'Customer',
		value: 'customer',
		children: makeOptions(fieldNames.orders.customer),
	},
	{
		name: 'Billing Address',
		value: 'billing_address',
		children: makeOptions(fieldNames.orders.billing_address),
	},
	{
		name: 'Shipping Address',
		value: 'shipping_address',
		children: makeOptions(fieldNames.orders.shipping_address),
	},
	{
		name: 'Client Details',
		value: 'client_details',
		children: makeOptions(fieldNames.orders.client_details),
	},
	{
		name: 'Line Items',
		value: 'line_items',
		children: makeOptions(fieldNames.orders.line_items),
	},
	{
		name: 'Refunds',
		value: 'refunds',
		children: makeOptions(fieldNames.orders.refunds),
	},
	{
		name: 'Transactions',
		value: 'transactions',
		children: makeOptions(fieldNames.orders.transactions),
	},
	{
		name: 'Risks',
		value: 'risks',
		children: makeOptions(fieldNames.orders.risks),
	},
	{
		name: 'Fulfillments',
		value: 'fulfillments',
		children: makeOptions(fieldNames.orders.fulfillments),
	},
];

export const customerFields = [
	{
		value: 'basic',
		name: 'Basic Columns',
		open: true,
		children: makeOptions(fieldNames.customers.basic),
	},
	{
		name: 'Customer Address',
		value: 'addresses',
		children: makeOptions(fieldNames.customers.addresses),
	},
];

export const customCollectionFields = [
	{
		value: 'basic',
		name: 'Basic Columns',
		open: true,
		children: makeOptions(fieldNames.custom_collections.basic),
	},
	{
		value: 'products',
		name: 'Products',
		open: false,
		children: makeOptions(fieldNames.custom_collections.products),
	},
];

export const automatedCollectionFields = [
	{
		value: 'basic',
		name: 'Basic Columns',
		open: true,
		children: makeOptions(fieldNames.smart_collections.basic),
	},
	{
		value: 'rules',
		name: 'Rules',
		open: false,
		children: makeOptions(fieldNames.smart_collections.rules),
	},
];

export const metaobjectEntriesFields = [
	{
		value: 'basic',
		name: 'Basic Columns',
		open: true,
		children: makeOptions(fieldNames.metaobject_entries.basic),
	},
	{
		value: 'field',
		name: 'Field Values',
		open: false,
		children: makeOptions(fieldNames.metaobject_entries.field),
	},
];

export const discountFields = [
	{
		value: 'basic',
		name: 'Product rules',
		open: true,
		children: makeOptions(fieldNames.price_rules.basic),
	},
	{
		name: 'Discount codes',
		value: 'discount_codes',
		children: makeOptions(fieldNames.price_rules.discount_codes),
	},
];
export const pagesFields = [
	{
		value: 'basic',
		name: 'Basic',
		open: true,
		children: makeOptions(fieldNames.pages.basic),
	},
];

export const blogsFields = [
	{
		value: 'articles',
		name: 'Blog Posts',
		open: true,
		children: makeOptions(fieldNames.blogs.articles),
	},
	{
		value: 'basic',
		name: 'Blog',
		open: false,
		children: makeOptions(fieldNames.blogs.basic),
	},
];

export function defaultFields(type) {
	switch (type) {
		case 'products':
		case 'smart_collections':
		case 'custom_collections':
			return ['id', 'handle'];
		case 'customers':
			return ['id', 'email'];
		case 'orders':
			return ['id', 'name', 'landing_site', 'referring_site'];

		default:
			return [];
	}
}

/**
 * Add default fields for Matrixify export.
 *
 * @param {string} format export file format.
 * @param {string} type export target (products, orders, ...).
 * @param {string} fields user selected fields.
 * @return {array} default fields array.
 */
export function addFields(format, type, fields) {
	if (format !== 'Matrixify') return [];
	switch (type) {
		case 'products':
			return [
				'command-basic',
				'row_number_command-basic',
				'top_row_command-basic',
				...(fields.includes('tags-basic') ? ['tags_command-basic'] : []),
				...(!fields.includes('id-basic') ? ['id-basic'] : []),
				...(!fields.includes('handle-basic') ? ['handle-basic'] : []),
				...(fields.includes('id-variants') ? ['variant_command-variants'] : []),
				...(fields.includes('src-images') ? ['image_command-images'] : []),
			];
		case 'smart_collections':
		case 'pages':
			return [
				'command-basic',
				'row_number_command-basic',
				'top_row_command-basic',
				...(!fields.includes('id-basic') ? ['id-basic'] : []),
				...(!fields.includes('handle-basic') ? ['handle-basic'] : []),
			];
		case 'custom_collections':
			return [
				'command-basic',
				'row_number_command-basic',
				'top_row_command-basic',
				...(!fields.includes('id-basic') ? ['id-basic'] : []),
				...(!fields.includes('handle-basic') ? ['handle-basic'] : []),
				...(fields.includes('id-products') ? ['product_command-products'] : []),
			];
		case 'customers':
			return [
				'command-basic',
				'row_number_command-basic',
				'top_row_command-basic',
				...(fields.includes('tags-basic') ? ['tags_command-basic'] : []),
				...(!fields.includes('id-basic') ? ['id-basic'] : []),
				...(!fields.includes('email-basic') ? ['email-basic'] : []),
				...(fields.includes('id-addresses') ? ['address_command-addresses'] : []),
			];
		case 'orders':
			return [
				'command-basic',
				'send_receip_command-basic',
				'inventory_behaviour_command-basic',
				'row_number_command-client_details',
				'top_row_command-client_details',
				...(fields.includes('tags-basic') ? ['tags_command-basic'] : []),
				...(!fields.includes('id-basic') ? ['id-basic'] : []),
				...(!fields.includes('name-basic') ? ['name-basic'] : []),
				...(fields.find(field =>
					[
						'id-line_items',
						'id-refunds',
						'id-transactions',
						'id-risks',
						'id-fulfillments',
					].includes(field),
				)
					? ['line_type_command-client_details', 'line_command-line_items']
					: []),
			];

		case 'metaobject_entries':
			return [
				'command-basic',
				'row_number_command-basic',
				'top_row_command-basic',
				...(!fields.includes('id-basic') ? ['id-basic'] : []),
				...(!fields.includes('handle-basic') ? ['handle-basic'] : []),
			];

		case 'price_rules':
			return [
				'command-basic',
				'row_number_command-basic',
				'top_row_command-basic',
				...(!fields.includes('id-basic') ? ['id-basic'] : []),
				...(!fields.includes('code-discount_codes') ? ['code-discount_codes'] : []),
			];
		case 'blogs':
			return [
				'command-articles',
				'row_number_command-basic',
				'top_row_command-basic',
				...(!fields.includes('id-basic') ? ['id-basic'] : []),
				...(!fields.includes('handle-basic') ? ['handle-basic'] : []),
				...(fields.includes('tags-articles') ? ['tags_command-articles'] : []),
			]

		default:
			return [];
	}
}

/**
 * Add default values for Matrixify export.
 *
 * @param {string} format export file format.
 * @param {string} type export target (products, orders, ...).
 * @param {object} item item value.
 * @param {number} index index of item.
 * @return {object} default values object.
 */
export function addValues(format, type, item, index) {
	if (format !== 'Matrixify') return {};
	switch (type) {
		case 'products':
			return {
				command: 'MERGE',
				tags_command: 'REPLACE',
				row_number_command: index + 1,
				variants__variant_command: item.variants__id ? 'MERGE' : '',
				images__image_command: item.images__src ? 'MERGE' : '',
			};

		case 'smart_collections':
		case 'custom_collections':
		case 'metaobject_entries':
		case 'price_rules':
		case 'pages':
			return {
				command: 'MERGE',
				row_number_command: index + 1,
				products__product_command: 'MERGE',
			};

		case 'customers':
			return {
				command: 'MERGE',
				tags_command: 'REPLACE',
				row_number_command: index + 1,
				addresses__address_command: item.addresses__id ? 'MERGE' : '',
			};

		case 'orders':
			return {
				command: 'New',
				send_receip_command: false,
				inventory_behaviour_command: 'bypass',
				tags_command: 'REPLACE',
				cancel_send_receipt: false,
				cancel_refund: false,
				client_details__row_number_command: index + 1,
			};

		case 'blogs':
			return {
				articles__command: 'MERGE',
				articles__tags_command: 'REPLACE',
				row_number_command: index + 1,
				variants__variant_command: item.variants__id ? 'MERGE' : '',
				images__image_command: item.images__src ? 'MERGE' : '',
			};

		default:
			return {};
	}
}

// remove "_" and capitalize the words
export function capitalize(string) {
	return string
		.toLowerCase()
		.split('_')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

// convert time format. ex: 2008-01-10T11:00:00-05:00 -> 2008-01-10 11:00:00 -0500
export function timeConv(obj, field, pre) {
	const prefix = pre ?? '';
	if (!obj[`${prefix}${field}`]) return obj;

	const split = obj[`${prefix}${field}`].split('T');
	const timeZone = split[1].match('[+?-](.*):00')?.[0];
	const value = `${split[0]} ${split[1].replace(timeZone, ` ${timeZone.replace(':', '')}`)}`;
	return {
		...obj,
		[`${prefix.slice(0, -1)}time_conv__${field}___${field}`]: value,
	};
}

export function getFormattedDate(string) {
	if (!string) return '';
	const split = string.split('T');
	const timeZone = split[1].match('[+?-](.*):00')?.[0];
	const value = `${split[0]} ${split[1].replace(timeZone, ` ${timeZone.replace(':', '')}`)}`;
	return value;
}

export function getGroup(type, fields) {
	let filters = {};
	for (const field of fields) {
		const split = field.split('-');

		if (split[1] === 'basic' || !split[1]) {
			filters['basic'] = filters['basic'] || [];
			filters['basic'].push(split[0]);
		} else {
			filters[split[1]] = filters[split[1]] || [];
			filters[split[1]].push(split[0]);
		}
	}

	let string = '';

	for (const item of Object.keys(filters)) {
		if (item === 'metafields') {
			string += ` ${filters[item]
				.map(
					i =>
						`--group=${
							i === 'h_product___metafields'
								? 'product_metafields'
								: 'variant_metafields'
						}`,
				)
				.join(' ')}`;
			continue;
		}
		const totalLength = fieldNames[type][item]
			? Object.keys(fieldNames[type][item]).filter(
					i => i !== 'is_main' && !i.includes('command') && i !== 'is_multi',
			  ).length
			: NaN;
		if (filters[item].length === totalLength) string += ` --group=${item}`;
		else string += ` ${filters[item].map(i => `--fields=${i}-${item}`).join(' ')}`;
	}

	return string;
}

export function getFieldsFromGroup(options) {
	if (!options.group?.length) return options.fields;
	let fields = !!options.fields ? [...options.fields] : [];
	if (typeof options.group === 'object') {
		for (const groupItem of options.group) {
			if (groupItem === 'product_metafields') {
				fields = [...fields, 'h_product___metafields-metafields'];
				continue;
			} else if (groupItem === 'variant_metafields') {
				fields = [...fields, 'h_variant___variant_metafields-metafields'];
				continue;
			}
			fields = [
				...fields,
				...Object.keys(fieldNames[options.type][groupItem])
					.filter(i => i !== 'is_main' && !i.includes('command') && i !== 'is_multi')
					.map(f => `${f}-${groupItem}`),
			];
		}
	}

	return fields;
}
