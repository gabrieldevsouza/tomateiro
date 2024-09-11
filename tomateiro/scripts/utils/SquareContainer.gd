@tool
extends Control

@onready var container: BoxContainer = get_parent()


func _ready() -> void:
	container = get_parent()
	resized.connect(compute)

func compute() -> void:
	if container == null:
		container = get_parent()
		if container == null:
			return
	
	var smaller_size = min(container.size.x, container.size.y)

	container.size = Vector2(smaller_size, smaller_size)
