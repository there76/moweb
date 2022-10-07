package com.hmsec.admin.main.web;

import com.hmsec.modules.base.users.model.AppManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Controller
public class IndexController {

    @GetMapping({"/admin"})
    public Object index() {
        return "thymeleaf/admin";
    }

    @GetMapping({"/admin/me"})
    @ResponseBody
    public ResponseEntity<?> getCategory(AppManager appManager) {
        Map<String, Object> info = new HashMap<>();

        info.put("user", appManager);
        //info.put("menus", menuManager.getMenuById("durepack-admin"));

        return ResponseEntity.ok(info);
    }
}
