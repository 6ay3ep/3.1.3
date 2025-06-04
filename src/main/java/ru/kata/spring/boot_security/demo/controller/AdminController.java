package ru.kata.spring.boot_security.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.RoleServiceImpl;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    public AdminController(UserService userService, RoleServiceImpl roleServiceImpl) {
        this.userService = userService;
        this.roleService = roleServiceImpl;
    }

    @GetMapping
    public String adminPage(Model model, Principal principal) {
        model.addAttribute("users", userService.findAll());
        model.addAttribute("currentUser", userService.findByUsername(principal.getName()));
        model.addAttribute("newUser", new User());
        return "admin";
    }

    @PostMapping("/update")
    public String updateUser(@ModelAttribute User user,
                             @RequestParam(value = "roles", required = false) List<Long> roleIds) {
        if (user.getId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        if (roleIds != null && !roleIds.isEmpty()) {
            user.setRoles(roleService.findRolesByIds(roleIds));
        } else {
            User existingUser = userService.findById(user.getId());
            user.setRoles(existingUser.getRoles());
        }

        userService.update(user.getId(), user);
        return "redirect:/admin";
    }

    @PostMapping("/delete")
    public String deleteUser(@RequestParam("id") Long id) {
        userService.deleteById(id);
        return "redirect:/admin";
    }

    @GetMapping("/add")
    public String showAddForm(Model model) {
        model.addAttribute("newUser", new User());
        model.addAttribute("allRoles", roleService.findAll());
        return "/admin";
    }

    @PostMapping("/add")
    public String addUser(@ModelAttribute("newUser") User user,
                          @RequestParam(value = "roles", required = false) List<Long> roleIds) {
        if (roleIds != null && !roleIds.isEmpty()) {
            user.setRoles(roleService.findRolesByIds(roleIds));
        }
        userService.save(user);
        return "redirect:/admin";
    }
}