export class VoteCreatedEvent {
    constructor(
        public readonly postId: string,
        public readonly postTitle: string,
        public readonly postSlug: string,
        public readonly voterId: string,
        public readonly voterUsername: string,
        public readonly voterNickname: string,
        public readonly direction: number,
        public readonly postOwnerId: string,
    ) { }
}

export class ReplyCreatedEvent {
    constructor(
        public readonly parentPostId: string,
        public readonly parentPostTitle: string,
        public readonly parentPostSlug: string,
        public readonly replyId: string,
        public readonly replySlug: string,
        public readonly replierId: string,
        public readonly replierUsername: string,
        public readonly replierNickname: string,
        public readonly postOwnerId: string,
    ) { }
}