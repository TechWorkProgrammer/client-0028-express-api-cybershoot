export default class User {
  id: number;
  username: string;
  total_score: number;

  constructor(id: number, username: string, total_score: number) {
    this.id = id;
    this.username = username;
    this.total_score = total_score;
  }
}
