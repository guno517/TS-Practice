interface Store { // 타입 알리아스 type alias
    currentPage: number; // 세미콜론
    feeds: NewsFeed[];
}

interface News {
    readonly id: number; // readonly: 변경 불가 기능
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

interface NewsFeed extends News { // intersection 기능 (중복 생략 가능)
    readonly comments_count: number;
    readonly points: number;
    read?: boolean; // ?는 선택 속성을 의미
}

interface NewsDetail extends News {
    readonly comments: NewsComment[];
}

interface NewsComment extends News {
    readonly comments: NewsComment[];
    readonly level: number;
}

interface RouteInfo {
  path: string;
  page: View;
}
