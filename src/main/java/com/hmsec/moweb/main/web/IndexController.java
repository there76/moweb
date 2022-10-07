package com.hmsec.moweb.main.web;


import com.hmsec.common.SimpleResponseModel;
import com.hmsec.modules.base.users.model.AppManager;
import com.hmsec.modules.base.users.model.AppUser;
import com.hmsec.modules.base.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Slf4j
@Controller
public class IndexController {

    private final UserService userService;

    @GetMapping("/")
    public String index(Model model, AppUser appUser) {

        AppUser user = userService.findByUserNo(appUser.getUserNo());

        log.info("user {}", user);

        model.addAttribute("user", user);


        return "thymeleaf/index";
    }


    @GetMapping({"/user"})
    @ResponseBody
    public ResponseEntity<?> getUserInfo(AppManager appManager) {

        AppUser user = userService.findByUserId("there");
        log.debug("user {}", user);

        return ResponseEntity.ok(user);
    }

    @GetMapping({"/userList"})
    @ResponseBody
    public ResponseEntity<?> getUserList() {

        List<HashMap<String,String>> list = userService.findAll();

        Map<String, Object> userList = new HashMap<>();
        userList.put("total", 10);
        userList.put("page", 1);
        userList.put("users", list.toArray());

        return ResponseEntity.ok(new SimpleResponseModel(200, "정상처리되었습니다.", userList));
    }


    @GetMapping({"/userMap"})
    @ResponseBody
    public ResponseEntity<?> getUserMap() {

        Map<String, Object> info = new HashMap<>();
        info.put("user", "there");
        info.put("name", "kim jae sung");
        info.put("age", "29");

        return ResponseEntity.ok(info);
    }

    @GetMapping("/login")
    public String login() {
        return "thymeleaf/login";
    }


}
