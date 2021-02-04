import { config } from 'dotenv';
import Twitter from 'twitter';
import { Tweets, Tweet } from './stores/Tweets';
import { User, Users } from './stores/Users';

config();

class TwitterAPI {
	client: Twitter

	tweets: Tweets
	users: Users

	constructor(creds?: {consumer_key: string, consumer_secret: string, access_token_key: string, access_token_secret: string}) {
		this.client = new Twitter({
			consumer_key: creds.consumer_key || process.env.TWITTER_CONSUMER_KEY,
			consumer_secret: creds.consumer_secret || process.env.TWITTER_CONSUMER_SECRET,
			access_token_key: creds.access_token_key || process.env.TWITTER_ACCESS_TOKEN,
			access_token_secret: creds.access_token_secret || process.env.TWITTER_ACCESS_TOKEN_SECRET
		});
		this.tweets = new Tweets(this);
		this.users = new Users(this);
	}


	get<T = any>(path: string, opts: Record<string, unknown>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.get(path, opts, (err, data) => {
				if (err) {
					return reject(err[0]);
				}
				if (typeof data[0] === 'undefined') {
					return resolve(data as T);
				}
				return resolve(data[0]);
			});
		});
	}

	post<T = any>(path: string, opts: Record<string, unknown>): Promise<any> {
		return new Promise((resolve, reject) => {
			this.client.post(path, opts, (err, data) => {
				if (err) {
					return reject(err[0]);
				}
				if (typeof data[0] === 'undefined') {
					return resolve(data as T);
				}
				return resolve(data[0]);
			});
		});
	}
}

export { TwitterAPI, User, Tweet, Users, Tweets, Twitter };
