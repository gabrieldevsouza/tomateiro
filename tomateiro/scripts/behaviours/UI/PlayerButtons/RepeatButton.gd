extends Node

@export var pomodoro_controller : PomodoroController

@export var repeat_button : BaseButton

func _ready() -> void:
	repeat_button.pressed.connect(on_repeat_pressed)

func on_repeat_pressed() -> void:
	pomodoro_controller.repeat()
