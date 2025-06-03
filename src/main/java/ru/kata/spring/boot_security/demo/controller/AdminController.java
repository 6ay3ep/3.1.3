package ru.kata.spring.boot_security.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.security.Principal;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping
    public String adminPage(Model model, Principal principal) {
        model.addAttribute("users", userService.findAll());
        model.addAttribute("currentUser", userService.findByUsername(principal.getName()));
        model.addAttribute("newUser", new User());
        return "admin";
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        if (user == null) {
            throw new RuntimeException("User not found with id: " + id);
        }
        model.addAttribute("user", user);
        model.addAttribute("allRoles", roleService.findAll());
        return "edit";
    }

    @PostMapping("/edit")
    public String updateUser(@ModelAttribute User user) {
        userService.update(user.getId(), user);
        return "redirect:/admin";
    }

    @GetMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return "redirect:/admin";
    }
    @GetMapping("/add")
    public String showAddForm(Model model) {
        model.addAttribute("newUser", new User());
        model.addAttribute("allRoles", roleService.findAll());
        return "add-user";
    }

    @PostMapping("/add")
    public String addUser(@ModelAttribute("newUser") User user) {
        userService.save(user);
        return "redirect:/admin";
    }
}