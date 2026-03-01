// Dictionary mapping ASL glosses to real human ASL Giphy/MP4 URLs. 
// These represent actual real-world footage for maximum realism.

export interface ASLMedia {
    url: string;
    type: 'gif' | 'video';
    durationMs: number; // Approximate reading time or duration of the GIF
}

export const ASL_GIF_DICTIONARY: Record<string, ASLMedia> = {
    "HELLO": {
        url: "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "THANK YOU": {
        url: "https://media.giphy.com/media/l41lTR6jmXXeP8r7i/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "THANK": {
        url: "https://media.giphy.com/media/l41lTR6jmXXeP8r7i/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "PLEASE": {
        url: "https://media.giphy.com/media/3o7TKQW7qC7TtrDNGU/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "YES": {
        url: "https://media.giphy.com/media/3o7TKK0yHruEQExF16/giphy.gif",
        type: 'gif',
        durationMs: 1500
    },
    "NO": {
        url: "https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif",
        type: 'gif',
        durationMs: 1500
    },
    "HELP": {
        url: "https://media.giphy.com/media/3o7TKVuO4xEE15aX6s/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "YOU": {
        url: "https://media.giphy.com/media/3o7TKRn6V9h2y30dEI/giphy.gif",
        type: 'gif',
        durationMs: 1500
    },
    "ME": {
        url: "https://media.giphy.com/media/3o7TKTlZk02O17qV3i/giphy.gif",
        type: 'gif',
        durationMs: 1500
    },
    "LOVE": {
        url: "https://media.giphy.com/media/xT9IgusfDcqpPFzjdS/giphy.gif",
        type: 'gif',
        durationMs: 2500
    },
    "FRIEND": {
        url: "https://media.giphy.com/media/3o7TKz31EaU9jZ8WqY/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "WHAT": {
        url: "https://media.giphy.com/media/3o7TKH8yWJ4X5i3kng/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "WHY": {
        url: "https://media.giphy.com/media/3o7TKDkZem8oJk21C8/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "SORRY": {
        url: "https://media.giphy.com/media/3o7TKEeT14A0A0t9RK/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "GOOD": {
        url: "https://media.giphy.com/media/3o7TKC9yN2K2s0xMdi/giphy.gif",
        type: 'gif',
        durationMs: 1500
    },
    "MORNING": {
        url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prKU/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "NIGHT": {
        url: "https://media.giphy.com/media/l41lSLKxZqCgTtdKw/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "EAT": {
        url: "https://media.giphy.com/media/3o7TKUw2U5UeW4vMkw/giphy.gif",
        type: 'gif',
        durationMs: 1800
    },
    "WATER": {
        url: "https://media.giphy.com/media/3o7TKz1rB58f9aVQQw/giphy.gif",
        type: 'gif',
        durationMs: 1800
    },
    "HOW": {
        url: "https://media.giphy.com/media/3o7TKQy8X2cKqZ4uOs/giphy.gif",
        type: 'gif',
        durationMs: 2000
    },
    "BEAUTIFUL": {
        url: "https://media.giphy.com/media/3o7TKLhxM5J8ZpQfUk/giphy.gif",
        type: 'gif',
        durationMs: 2500
    },
};
