import { createInterface, Interface } from 'readline';
import { TwitterAPI } from '../src';
import { Tweet } from '../src/stores/Tweets';
import { User } from '../src/stores/Users';

class TwitterConsole {
	rl: Interface
	client = new TwitterAPI()
	constructor() {
		this.rl = createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'TwitterTS> '
		});
		this.rl.prompt();

		this.rl.on('line', (line) => this.parse(line));
	}

	async parse(line: string): Promise<void> {
		if (line.startsWith('user#')) {
			const id = line.replace('user#', '');
			let user: User;
			try {
				user = await this.client.users.fetch(id);
			} catch (e) {
				console.error(e);
				return this.rl.prompt();
			}
			console.log(user);
			return this.rl.prompt();
		} else if (line.startsWith('tweet#')) {
			const id = line.replace('tweet#', '');
			let tweet: Tweet;
			try {
				tweet = await this.client.tweets.fetch(id);
			} catch (e) {
				console.error(e);
				return this.rl.prompt();
			}
			console.log(tweet);
			return this.rl.prompt();
		}
		return this.rl.prompt();
	}
}

new TwitterConsole();
