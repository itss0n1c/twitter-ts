import { TwitterAPI } from '..';
import BaseStore from './BaseStore';

interface UserEntities {
	[k: string]: {
		urls: {
			url: string,
			expanded_url: string,
			display_url: string,
			indices: number[]
		}[]
	}
}

export class User {
	id: string
	name: string
	username: string
	bio: string
	followers: number
	following: number
	likes: number
	created_at: string
	verified: boolean
	pfp: string
	banner: string
	location: string
	color: string
	tweets_count: number
	entities: UserEntities
	url: string
	client: TwitterAPI
	constructor(data: Record<string, any>, client: TwitterAPI) {
		Object.defineProperty(this, 'client', {
			value: client,
			configurable: true,
			writable: true
		});
		this.entities = data.entities;
		this.id = data.id_str;
		this.name = data.name;
		this.username = data.screen_name;
		this.bio = this.loadBioLinks(data.description);
		this.followers = data.followers_count;
		this.following = data.friends_count;
		this.likes = data.favourites_count;
		this.created_at = data.created_at;
		this.verified = data.verified;
		this.pfp = data.profile_image_url_https.replace('_normal', '');
		this.banner = data.profile_banner_url;
		this.location = data.location;
		this.color = data.profile_link_color;
		this.tweets_count = data.statuses_count;
		this.url = this.loadURL(data.url);
	}

	private loadURL(url: string) {
		if (url === null) {
			return url;
		}
		if (url.length === 0) {
			return url;
		}

		if (typeof this.entities.url === 'undefined') {
			return url;
		}
		if (this.entities.url.urls.length === 0) {
			return url;
		}

		const urlents = this.entities.url;
		for (const link of urlents.urls) {
			url = url.replace(link.url, link.expanded_url);
		}
		return url;
	}

	private loadBioLinks(bio: string) {
		if (bio.length === 0) {
			return bio;
		}

		const matchMention = bio.match(/@(\w){1,15}/g);
		if (matchMention !== null) {
			for (const mention of matchMention) {
				bio = bio.replace(mention, `[${mention}](https://twitter.com/${mention.replace('@', '')})`);
			}
		}

		const bioents = this.entities.description;
		for (const url of bioents.urls) {
			bio = bio.replace(url.url, url.expanded_url);
		}

		return bio;
	}

	async follow(): Promise<User> {
		if (this.username === 'S0n1c_Dev') {
			throw 'Can\'t follow myself!';
		}
		const user = await this.client.post('friendships/create', { user_id: this.id });

		return this.client.users.cache.get(user.id_str);
	}
}

export class Users {
	client: TwitterAPI
	cache = new BaseStore<string, User>()
	constructor(client: TwitterAPI) {
		this.client = client;

		this.init();
	}

	async init(): Promise<void> {
		const user = await this.client.get('account/verify_credentials', {});
		await this.fetch(user.id_str);
	}

	async fetch(id: string, cache = true): Promise<User> {
		let username: string;
		if (isNaN(Number(id))) {
			username = id;
		}
		if (typeof username !== 'undefined') {
			if (cache) {
				const find = this.cache.find(u => u.username === username);
				if (typeof find !== 'undefined') {
					return this.cache.get(find.id);
				}
			}

			const data = await this.client.get('users/show', { screen_name: username });

			const user = new User(data, this.client);
			this.cache.set(user.id, user);
			return this.cache.get(user.id);
		}
		if (cache) {
			if (this.cache.has(id)) {
				return this.cache.get(id);
			}
		}


		const data = await this.client.get('users/show', { user_id: id });

		const user = new User(data, this.client);
		this.cache.set(user.id, user);
		return this.cache.get(user.id);
	}
}
