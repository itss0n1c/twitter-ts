import { User } from './Users';
import BaseStore from './BaseStore';

import { TwitterAPI } from '..';

interface MediaEntities {
	urls: {
		url: string,
		expanded_url: string,
		display_url: string,
		indices: number[]
	}[]
	hashtags: {
		text: string,
		indices: number[]
	}[]
	user_mentions: {
		screen_name: string
		name: string
		id: string
		id_str: string
		indices: number[]
	}[]
	media: {
		id: number
		id_str: string
		indices: number[]
		media_url: string
		media_url_https: string
		url: string
		display_url: string
		expanded_url: string
		type: string
		sizes: any[]
	}[]
}

export class Tweet {
	private client: TwitterAPI
	id: string
	full_text: string
	source: string
	user: User
	created_at: string
	likes: string
	shares: string
	entities: MediaEntities
	media: string
	constructor(data: Record<string, any>, client: TwitterAPI) {
		Object.defineProperty(this, 'client', {
			value: client,
			configurable: true,
			writable: true
		});
		this.entities = data.entities;
		this.id = data.id_str;
		this.full_text = data.full_text;
		this.source = data.source;
		this.user = new User(data.user, client);
		this.created_at = data.created_at;
		this.likes = data.favorite_count;
		this.shares = data.retweet_count;
		this.media = this.loadMedia();
	}

	loadMedia(): string {
		let media: any;
		if (typeof this.entities.media !== 'undefined') {
			if (this.entities.media.length > 0) {
				[ media ] = this.entities.media;
				this.full_text = this.full_text.replace(media.url, '');
			}
		}


		if (this.entities.urls.length > 0) {
			const { urls } = this.entities;
			for (const url of urls) {
				this.full_text = this.full_text.replace(url.url, url.expanded_url);
			}
		}

		if (this.entities.hashtags.length > 0) {
			const { hashtags } = this.entities;
			for (const hashtag of hashtags) {
				this.full_text = this.full_text.replace(`#${hashtag.text}`, `[#${hashtag.text}](https://twitter.com/hashtag/jailbreak)`);
			}
		}

		if (this.entities.user_mentions.length > 0) {
			const { user_mentions } = this.entities;
			for (const mention of user_mentions) {
				this.full_text = this.full_text.replace(`@${mention.screen_name}`, `[@${mention.screen_name}](https://twitter.com/${mention.screen_name})`);
			}
		}

		if (typeof media !== 'undefined') {
			return media.media_url_https;
		}
		return '';
	}

	async retweet(): Promise<string> {
		await this.client.post(`statuses/retweet/${this.id}`, {});
		return `RT'd ${this.id}`;
	}
}

export class Tweets {
	client: TwitterAPI
	cache = new BaseStore<string, Tweet>()
	constructor(client: TwitterAPI) {
		this.client = client;
	}

	async fetch(id: string): Promise<Tweet> {
		if (this.cache.has(id)) {
			return this.cache.get(id);
		}
		const data = await this.client.get('statuses/lookup', { id,
			tweet_mode: 'extended' });
		const tweet = new Tweet(data, this.client);
		if (!this.client.users.cache.has(tweet.user.id)) {
			this.client.users.cache.set(tweet.user.id, tweet.user);
		}
		this.cache.set(tweet.id, tweet);
		return this.cache.get(id);
	}
}
