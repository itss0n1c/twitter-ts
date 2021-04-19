import { User } from './Users';
import BaseStore from './BaseStore';

import { TwitterAPI } from '..';
import { inspect } from 'util';

interface PhotoEntity {
	id: number
	id_str: string
	indices: number[]
	media_url: string
	media_url_https: string
	url: string
	display_url: string
	expanded_url: string
	type: 'photo'
	sizes: {
		[size: string]: {
			w: number
			h: number
			resize: string
		}
	}[]
}

interface VideoEntity {
	id: number
	id_str: string
	indices: number[]
	media_url: string
	media_url_https: string
	url: string
	display_url: string
	expanded_url: string
	type: 'video'
	sizes: {
		[size: string]: {
			w: number
			h: number
			resize: string
		}
	}[]
	video_info: {
		aspect_ratio: [number, number]
		duration_millis: number
		variants: {
			bitrate: number
			content_type: string
			url: string
		}[]
	}
}

type MediaEntity = PhotoEntity | VideoEntity;

interface Entities {
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
	media: MediaEntity[]
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
	entities: Entities
	media: string | {
		bitrate: number
		content_type: string
		url: string
	}[]

	mediaType: 'photo' | 'video'

	constructor(data: Record<string, any>, client: TwitterAPI) {
		Object.defineProperty(this, 'client', {
			value: client,
			configurable: true,
			writable: true
		});
		this.entities = data.entities;
		this.id = data.id_str;
		this.full_text = data.text;
		this.source = data.source;
		this.user = new User(data.user, client);
		this.created_at = data.created_at;
		this.likes = data.favorite_count;
		this.shares = data.retweet_count;
		if (typeof data.extended_entities !== 'undefined') {
			if (typeof data.extended_entities.media !== 'undefined') {
				for (const media of data.extended_entities.media) {
					this.entities.media.push(media);
				}
			}
		}

		this._handleEntities();
	}

	private _handleEntities(): void {
		if (this.entities.urls.length > 0) {
			const { urls } = this.entities;
			for (const url of urls) {
				this.full_text = this.full_text.replace(url.url, url.expanded_url);
			}
		}

		if (this.entities.hashtags.length > 0) {
			const { hashtags } = this.entities;
			for (const hashtag of hashtags) {
				this.full_text = this.full_text.replace(`#${hashtag.text}`, `[#${hashtag.text}](https://twitter.com/hashtag/#${hashtag.text})`);
			}
		}

		if (this.entities.user_mentions.length > 0) {
			const { user_mentions } = this.entities;
			for (const mention of user_mentions) {
				this.full_text = this.full_text.replace(`@${mention.screen_name}`, `[@${mention.screen_name}](https://twitter.com/${mention.screen_name})`);
			}
		}


		this.loadMedia();
	}

	loadMedia(): void {
		let media: any;

		if (typeof this.entities.media !== 'undefined') {
			if (this.entities.media.length > 0) {
				const findvideo = this.entities.media.filter(m => m.type === 'video');
				if (findvideo.length > 0) {
					this.mediaType = 'video';
					const video = findvideo[0] as VideoEntity;
					this.media = video.video_info.variants;
				} else {
					[ media ] = this.entities.media;
					this.full_text = this.full_text.replace(media.url, '');
				}
			}
		}

		if (typeof media !== 'undefined') {
			this.mediaType = 'photo';
			return media.media_url_https;
		}
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
		const data = await this.client.get(`statuses/show/${id}`, {
			include_entities: true });
		console.log(inspect(data, { depth: 10 }));
		const tweet = new Tweet(data, this.client);
		if (!this.client.users.cache.has(tweet.user.id)) {
			this.client.users.cache.set(tweet.user.id, tweet.user);
		}
		this.cache.set(tweet.id, tweet);
		return this.cache.get(id);
	}
}
