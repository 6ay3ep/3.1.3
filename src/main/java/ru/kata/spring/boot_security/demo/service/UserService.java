package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;

public interface UserService {
    User findById(Long id);
    void deleteById(Long id);
    void update(Long id, User updatedUser);
    void save(User user);
    List<User> findAll();
    User findByUsername(String username);
}
