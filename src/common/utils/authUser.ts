export const users:Map<string,string> = new Map([])

export const authUser = (auth: { [x: string]: any; username?: string; }) => {
    const {username} = auth;
    if ([...users].some(([id,user]) => user == username)) return false
    if (username && username.length > 0) {
        return true;
    } else {
        return false;
    }
};
