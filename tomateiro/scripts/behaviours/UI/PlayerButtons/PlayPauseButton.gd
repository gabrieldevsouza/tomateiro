extends Node

@export var pomodoro_controller : PomodoroController

@export var play_button : AutoSizeMaterialButton
@export var pause_button : AutoSizeMaterialButton


func _ready() -> void:
	play_button.pressed.connect(on_play_pressed)
	pause_button.pressed.connect(on_pause_pressed)

	pomodoro_controller.play_signal.connect(on_play)
	pomodoro_controller.pause_signal.connect(on_pause)
	pomodoro_controller.repeat_signal.connect(on_repeat)

	if pomodoro_controller.is_running_time:
		on_play()
	else:
		on_pause()

func on_play_pressed() -> void:
	pomodoro_controller.play()

func on_pause_pressed() -> void:
	pomodoro_controller.pause()

func on_play() -> void:
	show_pause_button()

func on_pause() -> void:
	show_play_button()

func on_repeat() -> void:
	show_play_button()

func show_play_button() -> void:
	pause_button.set_font_size(pause_button.get_font_size())

	pause_button.visible = false
	play_button.visible = true

func show_pause_button() -> void:
	pause_button.set_font_size(play_button.get_font_size())

	play_button.visible = false
	pause_button.visible = true