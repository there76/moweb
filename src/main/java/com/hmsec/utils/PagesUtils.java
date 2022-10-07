package com.hmsec.utils;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.Data;
import org.springframework.data.domain.Pageable;

import java.util.List;

public class PagesUtils {
    private PagesUtils() {
        //prevent new
    }

    public static void setPageableIfNotNull(Pageable pageable) {
        if (pageable != null) {
            PageHelper.startPage(pageable.getPageNumber() + 1, pageable.getPageSize());
        }
    }

    public static <E> ListPage<E> of(Page<E> page){
        return of(page, "dataTables");
    }

    public static <E> ListPage<E> of(Page<E> page, String type){
        if("dataTables".equals(type)){
            return new DataTablesPage<>(page);
        }

        return new DefaultPage<>(page);
    }

    public interface ListPage<E>{
        List<E> getData();
    }

    @Data
    public static class DefaultPage<E> implements ListPage<E>{
        private List<E> data;
        private long total;
        private int size;
        private int page;

        private DefaultPage(Page<E> page) {
            PageInfo<E> pageInfo = page.toPageInfo();

            this.data = page.getResult();
            this.total = pageInfo.getTotal();
            this.size = pageInfo.getSize();
            this.page = pageInfo.getPageNum();
        }
    }

    //https://www.bswen.com/2018/06/springboot-mybatis-with-pageHelper-and-DataTable.html
    @Data
    public static class DataTablesPage<E> implements ListPage<E>{
        private List<E> data;
        private int recordsTotal;
        private int recordsFiltered;

        private DataTablesPage(Page<E> page) {
            PageInfo<E> pageInfo = page.toPageInfo();

            this.data = page.getResult();
            this.recordsTotal = (int) pageInfo.getTotal();
            this.recordsFiltered = (int) pageInfo.getTotal();

            if(recordsTotal == 0){//클라이언트 페이징으로 전체 조회
                //pageInfo.getPageNum() ==0 && pageInfo.getPageSize() == 0


                int dataSize = this.data.size();
                if(dataSize > 0){
                    this.recordsTotal = dataSize;
                    this.recordsFiltered = dataSize;
                }
            }
        }

        @Data
        public class Meta {
            private String field;
            private String sort;

            private int page;
            private int pages;
            private int perpage;
            private long total;

            public Meta(PageInfo<E> pageInfo) {
                page = pageInfo.getPageNum();
                pages = pageInfo.getPages();
                perpage = pageInfo.getPageSize();
                total = pageInfo.getTotal();

            }
        }
    }
}
