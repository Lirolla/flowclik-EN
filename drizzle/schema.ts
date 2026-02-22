import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, text, timestamp, index, foreignKey, mysqlEnum, date, tinyint, bigint, boolean } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const aboutPage = mysqlTable("aboutPage", {
	id: int().autoincrement().primaryKey(),
	title: varchar({ length: 255 }).default('About Us'),
	subtitle: text(),
	mainContent: text(),
	mission: text(),
	vision: text(),
	values: text(),
	teamDescription: text(),
	imageUrl: text(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	tenantId: int().default(1).notNull(),
        isMaster: boolean("isMaster").default(false),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const albumGuests = mysqlTable("albumGuests", {
	id: int().autoincrement().primaryKey(),
	collectionId: int().notNull(),
	email: varchar({ length: 320 }).notNull(),
	name: varchar({ length: 255 }),
	rshetionship: varchar({ length: 100 }),
	viewedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("idx_collection").on(table.collectionId),
	index("idx_email").on(table.email),
]);

export const announcementViews = mysqlTable("announcement_views", {
	id: int().autoincrement().primaryKey(),
	announcementId: int().notNull().references(() => announcements.id, { onDhete: "cascade" } ),
	userId: int().notNull().references(() => users.id, { onDhete: "cascade" } ),
	dismissed: tinyint().default(0).notNull(),
	viewedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
});

export const announcements = mysqlTable("announcements", {
	id: int().autoincrement().primaryKey(),
	title: varchar({ length: 255 }),
	message: text(),
	type: mysqlEnum(['urgent','important','info']).default('info').notNull(),
	targetPlan: mysqlEnum(['all','starter','pro','enterprise']).default('all').notNull(),
	isActive: tinyint().default(1).notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdBy: int().notNull(),
	tenantId: int().default(0).notNull(),
});

export const appointmentExtras = mysqlTable("appointmentExtras", {
	id: int().autoincrement().primaryKey(),
	appointmentId: int().notNull(),
	description: varchar({ length: 255 }).notNull(),
	price: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
});

export const appointmentPhotos = mysqlTable("appointmentPhotos", {
	id: int().autoincrement().primaryKey(),
	appointmentId: int().notNull(),
	photoUrl: text().notNull(),
	thumbnailUrl: text(),
	fileName: varchar({ length: 255 }).notNull(),
	fileSize: int(),
	isSelectedByClient: tinyint().default(0).notNull(),
	uploadedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const appointments = mysqlTable("appointments", {
	id: int().autoincrement().primaryKey(),
	serviceId: int(),
	userId: int(),
	clientName: varchar({ length: 255 }).notNull(),
	clientEmail: varchar({ length: 320 }).notNull(),
	clientPhone: varchar({ length: 50 }),
	appointmentDate: timestamp({ mode: 'string' }).notNull(),
	status: mysqlEnum(['pending','awaiting_payment','confirmed','session_done','editing','awaiting_selection','final_editing','delivered','cancelled']).default('pending').notNull(),
	notes: text(),
	contractUrl: text(),
	contractSigned: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	appointmentTime: varchar({ length: 10 }),
	eventLocation: text(),
	numberOfPeople: int(),
	estimatedDuration: varchar({ length: 50 }),
	adminNotes: text(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	selectionApproved: tinyint().default(0).notNull(),
	selectionApprovedAt: timestamp({ mode: 'string' }),
	paymentStatus: mysqlEnum(['pending','awaiting_payment','partial','paid','failed','refunded']).default('pending'),
	finalPrice: int(),
	stripeSessionId: varchar({ length: 255 }),
	stripePaymentIntentId: varchar({ length: 255 }),
	paidAt: timestamp({ mode: 'string' }),
	paymentMethod: mysqlEnum(['cash','bank_transfer','stripe','pix','payment_link']),
	paidAmount: int().default(0),
	slug: varchar({ length: 255 }),
	customServiceName: varchar({ length: 255 }),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("idx_appointments_tenantId").on(table.tenantId),
	index("idx_appointments_status").on(table.status),
	index("idx_appointments_serviceId").on(table.serviceId),
]);

export const bannerSlides = mysqlTable("bannerSlides", {
	id: int().autoincrement().primaryKey(),
	slideType: mysqlEnum(['image','video']).default('image').notNull(),
	imageUrl: text(),
	videoUrl: text(),
	title: varchar({ length: 255 }),
	description: text(),
	buttonText: varchar({ length: 100 }),
	buttonLink: varchar({ length: 500 }),
	isActive: tinyint().default(1).notNull(),
	sortOrder: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	displayOn: mysqlEnum(['photography','video','both']).default('both').notNull(),
	tenantId: int().default(1).notNull(),
});

export const blockedDates = mysqlTable("blockedDates", {
	id: int().autoincrement().primaryKey(),
	reason: varchar({ length: 255 }),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }).notNull(),
	tenantId: int().default(1).notNull(),
});

export const clientMessages = mysqlTable("clientMessages", {
	id: int().autoincrement().primaryKey(),
	appointmentId: int().notNull(),
	senderId: int().notNull(),
	senderRole: mysqlEnum(['admin','client']).notNull(),
	message: text().notNull(),
	fileUrl: text(),
	fileName: varchar({ length: 255 }),
	isRead: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
});

export const collections = mysqlTable("collections", {
	id: int().autoincrement().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	coverImageUrl: text(),
	isFeatured: tinyint().default(0).notNull(),
	isPublic: tinyint().default(1).notNull(),
	sortOrder: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	appointmentId: int(),
	layoutType: mysqlEnum(['grid','masonry','fullscreen']).default('masonry').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	eventDate: date({ mode: 'string' }),
	password: varchar({ length: 255 }),
	salesEnabled: tinyint().default(0).notNull(),
	publicSlug: varchar({ length: 255 }),
	pricePerPhoto: int().default(2500).notNull(),
	tenantId: int().default(1).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("collections_slug_unique").on(table.slug),
	index("collections_publicSlug_unique").on(table.publicSlug),
	index("idx_collections_tenantId").on(table.tenantId),
	index("idx_collections_appointmentId").on(table.appointmentId),
	index("idx_collections_slug").on(table.slug),
]);

export const contactInfo = mysqlTable("contactInfo", {
	id: int().autoincrement().primaryKey(),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	whatsapp: varchar({ length: 50 }),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	zipCode: varchar({ length: 20 }),
	country: varchar({ length: 100 }).default('Brasil'),
	mapLatitude: varchar({ length: 50 }),
	mapLongitude: varchar({ length: 50 }),
	instagramUrl: text(),
	facebookUrl: text(),
	linkedinUrl: text(),
	twitterUrl: text(),
	youtubeUrl: text(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	tenantId: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const contractTemplates = mysqlTable("contractTemplates", {
	id: int().autoincrement().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	content: text().notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	tenantId: int().default(1).notNull(),
});

export const contracts = mysqlTable("contracts", {
	id: int().autoincrement().primaryKey(),
	tenantId: int().default(27).notNull(),
	appointmentId: int(),
	templateId: int(),
	clientName: varchar({ length: 255 }).notNull(),
	clientEmail: varchar({ length: 320 }),
	content: text().notNull(),
	templateName: varchar({ length: 255 }),
	serviceName: varchar({ length: 255 }),
	price: varchar({ length: 50 }),
	status: mysqlEnum(['draft','sent','signed']).default('draft').notNull(),
	sentAt: timestamp({ mode: 'string' }),
	signedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});


export const coupons = mysqlTable("coupons", {
	id: int().autoincrement().primaryKey(),
	code: varchar({ length: 50 }).notNull(),
	discountType: mysqlEnum(['percentage','fixed']).notNull(),
	discountValue: int().notNull(),
	minPurchase: int().default(0),
	maxUses: int(),
	usedCount: int().default(0).notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("coupons_code_unique").on(table.code),
]);

export const downloadLogs = mysqlTable("downloadLogs", {
	id: int().autoincrement().primaryKey(),
	collectionId: int().notNull(),
	userId: int().notNull(),
	downloadType: mysqlEnum(['single_photo','all_photos_zip']).notNull(),
	photoId: int(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
});

export const downloadPermissions = mysqlTable("downloadPermissions", {
	id: int().autoincrement().primaryKey(),
	collectionId: int().notNull(),
	allowDownload: tinyint().default(0).notNull(),
	downloadExpiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("downloadPermissions_collectionId_unique").on(table.collectionId),
]);

export const finalAlbums = mysqlTable("finalAlbums", {
	id: int().autoincrement().primaryKey(),
	appointmentId: int().notNull(),
	photoUrl: text().notNull(),
	thumbnailUrl: text(),
	fileName: varchar({ length: 255 }).notNull(),
	fileSize: int(),
	order: int().default(0).notNull(),
	uploadedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("idx_finalAlbums_appointmentId").on(table.appointmentId),
	index("idx_finalAlbums_tenantId").on(table.tenantId),
]);

export const medayItems = mysqlTable("medayItems", {
	id: int().autoincrement().primaryKey(),
	collectionId: int(),
	medayType: mysqlEnum(['photo','video']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	originalUrl: text().notNull(),
	previewUrl: text(),
	thumbnailUrl: text(),
	priceDigital: int().default(0),
	width: int(),
	height: int(),
	isPublic: tinyint().default(1).notNull(),
	isFeatured: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	price: int().default(0).notNull(),
	isStock: tinyint().default(0).notNull(),
	category: mysqlEnum(['paisagem','carros','pessoas','eventos','produtos','others']),
	stockDescription: text(),
	isFavorite: tinyint().default(0).notNull(),
	availableForSale: tinyint().default(0).notNull(),
	watermarkedUrl: text(),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("idx_medayItems_collectionId").on(table.collectionId),
	index("idx_medayItems_tenantId").on(table.tenantId),
]);

export const orderItems = mysqlTable("orderItems", {
	id: int().autoincrement().primaryKey(),
	orderId: int().notNull(),
	medayId: int(),
	itemType: mysqlEnum(['digital','print']).notNull(),
	itemName: varchar({ length: 255 }).notNull(),
	price: int().notNull(),
	quantity: int().default(1).notNull(),
	printSize: varchar({ length: 50 }),
	tenantId: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const orders = mysqlTable("orders", {
	id: int().autoincrement().primaryKey(),
	userId: int(),
	customerName: varchar({ length: 255 }).notNull(),
	customerEmail: varchar({ length: 320 }).notNull(),
	totalAmount: int().notNull(),
	discountAmount: int().default(0).notNull(),
	finalAmount: int().notNull(),
	status: mysqlEnum(['pending','paid','processing','completed','cancelled']).default('pending').notNull(),
	stripePaymentId: varchar({ length: 255 }),
	couponCode: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	paymentMethod: mysqlEnum(['pix','payment_link','bank_transfer']),
	paymentLink: varchar({ length: 500 }),
	customerPhone: varchar({ length: 20 }),
	tenantId: int().default(1).notNull(),
});

export const paymentTransactions = mysqlTable("paymentTransactions", {
	id: int().autoincrement().primaryKey(),
	appointmentId: int().notNull(),
	amount: int().notNull(),
	paymentMethod: mysqlEnum(['cash','bank_transfer','stripe','pix','payment_link']).notNull(),
	status: mysqlEnum(['pending','completed','failed','refunded']).default('pending').notNull(),
	stripePaymentIntentId: varchar({ length: 255 }),
	notes: text(),
	paidAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
});

export const photoComments = mysqlTable("photoComments", {
	id: int().autoincrement().primaryKey(),
	photoId: int().notNull(),
	appointmentId: int().notNull(),
	clientEmail: varchar({ length: 255 }).notNull(),
	comment: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
});

export const photoSales = mysqlTable("photoSales", {
	id: int().autoincrement().primaryKey(),
	photoId: int().notNull(),
	buyerEmail: varchar({ length: 320 }).notNull(),
	buyerName: varchar({ length: 255 }).notNull(),
	amount: int().notNull(),
	stripeSessionId: varchar({ length: 255 }).notNull(),
	stripePaymentIntentId: varchar({ length: 255 }),
	status: mysqlEnum(['pending','paid','failed','refunded']).default('pending').notNull(),
	downloadToken: varchar({ length: 64 }),
	downloadExpiresAt: timestamp({ mode: 'string' }),
	downloadCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	paidAt: timestamp({ mode: 'string' }),
	productType: mysqlEnum(['digital','framed']).default('digital').notNull(),
	frameSize: varchar({ length: 50 }),
	frameType: varchar({ length: 50 }),
	collectionId: int(),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("photoSales_downloadToken_unique").on(table.downloadToken),
]);

export const photoSelections = mysqlTable("photoSelections", {
	id: int().autoincrement().primaryKey(),
	medayItemId: int().notNull(),
	collectionId: int().notNull(),
	isSelected: tinyint().default(0).notNull(),
	clientFeedback: text(),
	editedPhotoUrl: text(),
	status: mysqlEnum(['pending','editing','completed']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("idx_photoSelections_collectionId").on(table.collectionId),
	index("idx_photoSelections_isSelected").on(table.isSelected),
	index("idx_photoSelections_tenantId").on(table.tenantId),
]);

export const portfolioItems = mysqlTable("portfolioItems", {
	id: int().autoincrement().primaryKey(),
	title: varchar({ length: 255 }),
	description: text(),
	location: varchar({ length: 255 }),
	story: text(),
	imageUrl: text(),
	thumbnailUrl: text(),
	sortOrder: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	showOnHome: tinyint().default(0).notNull(),
	type: mysqlEnum(['photo','video']).default('photo').notNull(),
	videoUrl: text(),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("idx_portfolioItems_tenantId").on(table.tenantId),
	index("idx_portfolioItems_isActive").on(table.isActive),
	index("idx_portfolioItems_showOnHome").on(table.showOnHome),
]);

export const products = mysqlTable("products", {
	id: int().autoincrement().primaryKey(),
	collectionId: int(),
	type: mysqlEnum(['digital','print','service']).notNull(),
	title: varchar({ length: 255 }),
	description: text(),
	originalUrl: text(),
	originalKey: text(),
	previewUrl: text(),
	previewKey: text(),
	thumbnailUrl: text(),
	thumbnailKey: text(),
	videoUrl: text(),
	videoKey: text(),
	priceDigital: int().default(0),
	pricePrint: int().default(0),
	priceService: int().default(0),
	width: int(),
	height: int(),
	fileSize: int(),
	mimeType: varchar({ length: 100 }),
	printOptions: text(),
	isPublic: tinyint().default(1).notNull(),
	isFeatured: tinyint().default(0).notNull(),
	ftpPath: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const services = mysqlTable("services", {
	id: int().autoincrement().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	price: int().notNull(),
	duration: int(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	serviceType: mysqlEnum(['photography','video','both']).default('photography').notNull(),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("services_slug_unique").on(table.slug),
	index("idx_services_tenantId").on(table.tenantId),
	index("idx_services_isActive").on(table.isActive),
]);

export const siteConfig = mysqlTable("siteConfig", {
	id: int().autoincrement().primaryKey(),
	activeTemplate: varchar({ length: 50 }).default('centro-classico').notNull(),
	siteName: varchar({ length: 255 }).default('Lirolla').notNull(),
	siteTagline: text(),
	logoUrl: text(),
	primaryColor: varchar({ length: 50 }).default('#000000'),
	accentColor: varchar({ length: 50 }).default('#C9A961'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	businessMode: mysqlEnum(['photography_only','video_only','both']).default('photography_only').notNull(),
	aboutTitle: varchar({ length: 255 }),
	aboutContent: text(),
	aboutImage: text(),
	aboutMission: text(),
	aboutVision: text(),
	aboutValues: text(),
	servicesIntro: text(),
	contactPhone: varchar({ length: 50 }),
	contactEmail: varchar({ length: 255 }),
	contactWhatsApp: varchar({ length: 50 }),
	contactAddress: text(),
	socialInstagram: varchar({ length: 255 }),
	socialFacebook: varchar({ length: 255 }),
	socialYouTube: varchar({ length: 255 }),
	stockPhotosEnabled: tinyint().default(0).notNull(),
	templateName: varchar({ length: 100 }),
	templateDescription: text(),
	parallaxEnabled: tinyint().default(0).notNull(),
	parallaxImageUrl: text(),
	parallaxTitle: varchar({ length: 255 }),
	parallaxSubtitle: text(),
	paymentStripeEnabled: tinyint().default(1).notNull(),
	paymentBankTransferEnabled: tinyint().default(0).notNull(),
	paymentBankDetails: text(),
	paymentCashEnabled: tinyint().default(0).notNull(),
	paymentCashInstructions: text(),
	paymentPixEnabled: tinyint().default(0).notNull(),
	paymentPixKey: text(),
	paymentLinkEnabled: tinyint().default(0).notNull(),
	baseCountry: varchar({ length: 100 }).default('Brasil'),
	baseCurrency: varchar({ length: 10 }).default('GBP'),
	currencySymbol: varchar({ length: 10 }).default('£'),
	timezone: varchar({ length: 100 }).default('Europe/London'),
	phoneCountryCode: varchar({ length: 10 }).default('+44'),
	tenantId: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	siteThemeLayout: mysqlEnum(['classic','sidebar','wedding','wedding-videos','editorial','cinematic']).default('classic').notNull(),
	siteThemeMode: mysqlEnum(['light','dark']).default('dark').notNull(),
	siteThemeAccentColor: mysqlEnum(['red','black','blue']).default('red').notNull(),
	emailSender: varchar({ length: 255 }),
	resendApiKey: varchar({ length: 255 }),
	siteFont: mysqlEnum(['poppins','inter','roboto','playfair','montserrat','lato']).default('poppins').notNull(),
});

export const stockPhotos = mysqlTable("stockPhotos", {
	id: int().autoincrement().primaryKey(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	category: mysqlEnum(['paisagem','carros','pessoas','eventos','produtos','others']).notNull(),
	originalUrl: text().notNull(),
	thumbnailUrl: text(),
	previewUrl: text(),
	price: int().default(0).notNull(),
	width: int(),
	height: int(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	frameEnabled: tinyint().default(0).notNull(),
	tenantId: int().default(1).notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
	id: int().autoincrement().primaryKey(),
	tenantId: int().notNull().references(() => tenants.id, { onDhete: "cascade" } ),
	plan: mysqlEnum(['starter','pro','enterprise','full']).default('starter').notNull(),
	status: mysqlEnum(['trialing','active','past_due','cancelled','paused']).default('trialing').notNull(),
	storageLimit: bigint({ mode: "number" }).default(10737418240).notNull(),
	galleryLimit: int().default(10).notNull(),
	extraStorage: bigint({ mode: "number" }).default(0).notNull(),
	extraGalleries: int().default(0).notNull(),
	currentPeriodStart: timestamp({ mode: 'string' }),
	currentPeriodEnd: timestamp({ mode: 'string' }),
	cancelAtPeriodEnd: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	canchedAt: timestamp("canched_at", { mode: 'string' }),
	stripeCustomerId: varchar({ length: 255 }),
	stripeSubscriptionId: varchar({ length: 255 }),
},
(table) => [
	index("idx_subscriptions_status").on(table.status),
	index("idx_subscriptions_tenantId").on(table.tenantId),
]);

export const supportTicketReplies = mysqlTable("support_ticket_replies", {
	id: int().autoincrement().primaryKey(),
	ticketId: int().notNull(),
	userId: int().notNull(),
	message: text().notNull(),
	isInternal: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("idx_ticket").on(table.ticketId),
]);

export const supportTickets = mysqlTable("support_tickets", {
	id: int().autoincrement().primaryKey(),
	tenantId: int().notNull(),
	userId: int().notNull(),
	subject: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	status: mysqlEnum(['open','in_progress','resolved','closed']).default('open').notNull(),
	priority: mysqlEnum(['low','normal','high','urgent']).default('normal').notNull(),
	lastReplyAt: timestamp({ mode: 'string' }),
	lastReplyBy: int(),
	resolvedAt: timestamp({ mode: 'string' }),
	resolvedBy: int(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_tenant").on(table.tenantId),
	index("idx_status").on(table.status),
	index("idx_supportTickets_status").on(table.status),
]);

export const tenants = mysqlTable("tenants", {
	id: int().autoincrement().primaryKey(),
	subdomain: varchar({ length: 100 }).notNull(),
	customDomain: varchar({ length: 255 }),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	logo: text(),
	primaryColor: varchar({ length: 50 }).default('#000000'),
	accentColor: varchar({ length: 50 }).default('#C9A961'),
	baseCountry: varchar({ length: 100 }).default('Brasil'),
	baseCurrency: varchar({ length: 10 }).default('GBP'),
	currencySymbol: varchar({ length: 10 }).default('£'),
	timezone: varchar({ length: 100 }).default('Europe/London'),
	status: mysqlEnum(['active','suspended','cancelled']).default('active').notNull(),
	trialEndsAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("subdomain").on(table.subdomain),
]);

// Tabshe de domains customs
export const customDomains = mysqlTable("custom_domains", {
	id: int().autoincrement().primaryKey(),
	tenantId: int().notNull(),
	domain: varchar({ length: 255 }).notNull(), // ex: photographylirolla.com
	verified: tinyint().default(0).notNull(), // Se o DNS foi verified (0=false, 1=true)
	verifiedAt: timestamp({ mode: 'string' }),
	status: mysqlEnum(['pending','active','failed']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("tenantId").on(table.tenantId),
	index("domain").on(table.domain),
]);

export const clients = mysqlTable("clients", {
	id: int().autoincrement().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	postcode: varchar({ length: 20 }),
	country: varchar({ length: 100 }),
	notes: text(),
	tenantId: int().default(1).notNull(),
	createdAt: timestamp({ mode: "string" }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_tenant").on(table.tenantId),
	index("idx_email").on(table.email),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().primaryKey(),
	openId: varchar({ length: 64 }),
	password: varchar({ length: 255 }),
	name: text(),
	email: varchar({ length: 320 }).notNull(),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin','master']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	phone: varchar({ length: 50 }),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	zipCode: varchar({ length: 20 }),
	country: varchar({ length: 100 }).default('Brasil'),
	cpf: varchar({ length: 20 }),
	street: varchar({ length: 255 }),
	number: varchar({ length: 20 }),
	complement: varchar({ length: 100 }),
	neighborhood: varchar({ length: 100 }),
	fullName: varchar({ length: 255 }),
	tenantId: int().default(1).notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);


// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabshe de add-ons individuais (each add-on tem ciclo own)
export const subscriptionAddons = mysqlTable("subscription_addons", {
	id: int().autoincrement().primaryKey(),
	tenantId: int("tenant_id").notNull().references(() => tenants.id, { onDhete: "cascade" }),
	subscriptionId: int("subscription_id").notNull(),
	addonType: mysqlEnum("addon_type", ['storage','galleries']).notNull(),
	stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull(),
	stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
	status: mysqlEnum(['active','past_due','cancelled','paused']).default('active').notNull(),
	quantity: int().default(1).notNull(),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	canchedAt: timestamp("canched_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_addon_tenant").on(table.tenantId),
	index("idx_addon_stripe_sub").on(table.stripeSubscriptionId),
]);


// ============ EMAIL MARKETING ============

export const clientEvents = mysqlTable("clientEvents", {
id: int().autoincrement().primaryKey(),
clientId: int().notNull(),
tenantId: int().notNull(),
eventType: mysqlEnum(['birthday','wedding','session','anniversary','other']).notNull(),
eventName: varchar({ length: 255 }).notNull(),
eventDate: timestamp({ mode: 'string' }).notNull(),
notes: text(),
autoSendEmail: tinyint().default(0).notNull(),
templateId: int(),
createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
index('idx_ce_tenant').on(table.tenantId),
index('idx_ce_client').on(table.clientId),
index('idx_ce_date').on(table.eventDate),
]);

export const emailTemplates = mysqlTable("emailTemplates", {
id: int().autoincrement().primaryKey(),
tenantId: int().notNull(),
name: varchar({ length: 255 }).notNull(),
subject: varchar({ length: 500 }).notNull(),
htmlContent: text().notNull(),
category: mysqlEnum(['birthday','promotion','reminder','thank_you','welcome','custom']).default('custom').notNull(),
isDefault: tinyint().default(0).notNull(),
createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
index('idx_et_tenant').on(table.tenantId),
]);

export const emailCampaigns = mysqlTable("emailCampaigns", {
id: int().autoincrement().primaryKey(),
tenantId: int().notNull(),
name: varchar({ length: 255 }).notNull(),
templateId: int(),
subject: varchar({ length: 500 }).notNull(),
htmlContent: text().notNull(),
status: mysqlEnum(['draft','sending','sent','failed']).default('draft').notNull(),
recipientType: mysqlEnum(['all','selected','event_based']).default('all').notNull(),
recipientIds: text(),
sentCount: int().default(0).notNull(),
failedCount: int().default(0).notNull(),
scheduledAt: timestamp({ mode: 'string' }),
sentAt: timestamp({ mode: 'string' }),
createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
index('idx_ec_tenant').on(table.tenantId),
]);

export const emailLogs = mysqlTable("emailLogs", {
id: int().autoincrement().primaryKey(),
tenantId: int().notNull(),
campaignId: int(),
clientId: int(),
toEmail: varchar({ length: 320 }).notNull(),
toName: varchar({ length: 255 }),
subject: varchar({ length: 500 }).notNull(),
status: mysqlEnum(['sent','failed','bounced']).default('sent').notNull(),
resendMessageId: varchar({ length: 255 }),
errorMessage: text(),
sentAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
index('idx_el_tenant').on(table.tenantId),
index('idx_el_campaign').on(table.campaignId),
index('idx_el_client').on(table.clientId),
]);
