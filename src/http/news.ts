import axios from "@/http/axios .ts";

export interface newsData {
    id?: number | null;
    newsTitle:string
    newsType:number
    newsContent:string

}


// ✅ 编辑新闻（只用 update）
export const updateNews = (data: newsData) => {
    return axios({
        url: '/api/news/updateNews',
        method: 'POST',
        data
    });
};

export const saveNews=(data:newsData)=>{

    return axios({
        url:'/api/news/saveNews',
        method:'POST',
        data
    })
}


export const newsList = (start:number,rows:number)=>{
    return axios({
        url:'/api/news/newsList',
        method:'GET',
        params:{
            currentPage:start,
            rows}
    })
}

export const deleteNews = (id: number) => {
    return axios({
        url: '/api/news/deleteNews',
        method: 'POST',
        data: id
    });
};

// 更新新闻状态
export const updateNewsStatus = (id: number, status: string) => {
    return axios({
        url: '/api/news/updateNewsStatus',
        method: 'POST',
        data: { id, status }
    });
};